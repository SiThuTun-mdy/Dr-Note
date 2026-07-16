"use server"

import { createClient } from "@/lib/supabase/server"
import type { DiagnosisBadge } from "@/types/visit"

export interface ScreeningData {
  bp_systolic: number | null
  bp_diastolic: number | null
  heart_rate: number | null
  temperature_c: number | null
  oxygen_saturation: number | null
  height_cm: number | null
  weight_kg: number | null
  bmi: number | null
}

export interface VisitDetail {
  id: string
  chief_complaint: string | null
  diagnosis_note: string | null
  doctor_name: string | null
  diagnoses: DiagnosisBadge[]
  has_prescription: boolean
  screening: ScreeningData | null
}

/**
 * Fetch expanded details for a single visit (diagnoses, doctor note, prescription flag).
 * Used by the expandable visit-history rows on the patient profile page.
 */
export async function getVisitDetail(visitId: string): Promise<VisitDetail | null> {
  const supabase = await createClient()

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("id, chief_complaint, diagnosis_note, doctor_id")
    .eq("id", visitId)
    .single()

  if (visitError || !visit) return null

  // Doctor name
  let doctorName: string | null = null
  if (visit.doctor_id) {
    const { data: doctor } = await supabase
      .from("users")
      .select("name")
      .eq("id", visit.doctor_id)
      .single()
    doctorName = doctor?.name ?? null
  }

  // Diagnoses
  const { data: visitDiagnoses } = await supabase
    .from("visit_diagnoses")
    .select("diagnosis_type, diagnoses(code, title)")
    .eq("visit_id", visitId)

  const diagnoses: DiagnosisBadge[] = (visitDiagnoses || [])
    .map((vd) => {
      const d = vd.diagnoses as unknown as { code: string; title: string } | null
      return d
        ? { code: d.code, title: d.title, type: vd.diagnosis_type as DiagnosisBadge["type"] }
        : null
    })
    .filter(Boolean) as DiagnosisBadge[]

  // Prescription flag
  const { count } = await supabase
    .from("prescriptions")
    .select("visit_id", { count: "exact", head: true })
    .eq("visit_id", visitId)

  // Screening / vitals
  const { data: screening } = await supabase
    .from("screenings")
    .select("bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, height_cm, weight_kg, bmi")
    .eq("visit_id", visitId)
    .maybeSingle()

  return {
    id: visit.id,
    chief_complaint: visit.chief_complaint,
    diagnosis_note: visit.diagnosis_note,
    doctor_name: doctorName,
    diagnoses,
    has_prescription: (count ?? 0) > 0,
    screening: screening ?? null,
  }
}
