"use server"

import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export interface DiagnosisBadge {
  code: string
  title: string
  type: "primary" | "secondary" | "suspected"
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

// ---------------------------------------------------------------------------
// Server action — fetch expanded visit detail (diagnoses, screening, etc.)
// ---------------------------------------------------------------------------

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getVisitDetail(visitId: string): Promise<VisitDetail | null> {
  if (!uuidRegex.test(visitId)) {
    console.error("[getVisitDetail] invalid UUID", visitId)
    return null
  }

  const supabase = await createClient()

  // 1. Visit core data
  const { data: visit, error: visitErr } = await supabase
    .from("visits")
    .select("id, chief_complaint, diagnosis_note, doctor_id")
    .eq("id", visitId)
    .single()

  if (visitErr || !visit) {
    console.error("[getVisitDetail] visit query failed", { visitId, error: visitErr })
    return null
  }

  // Doctor name (separate query — RLS on users table may block joins)
  let doctorName: string | null = null
  if (visit.doctor_id) {
    const { data: doctor } = await supabase
      .from("users")
      .select("name")
      .eq("id", visit.doctor_id)
      .single()
    doctorName = doctor?.name ?? null
  }

  // 2. Diagnoses
  const { data: diagRows } = await supabase
    .from("visit_diagnoses")
    .select("diagnoses(code, name), diagnosis_type")
    .eq("visit_id", visitId)

  const diagnoses: DiagnosisBadge[] = (diagRows ?? []).map((row) => {
    const diag = row.diagnoses as unknown as { code: string; name: string } | null
    return {
      code: diag?.code ?? "—",
      title: diag?.name ?? "—",
      type: (row.diagnosis_type as DiagnosisBadge["type"]) ?? "secondary",
    }
  })

  // 3. Prescription flag
  const { count } = await supabase
    .from("prescriptions")
    .select("visit_id", { count: "exact", head: true })
    .eq("visit_id", visitId)

  // 4. Screening vitals
  const { data: screening } = await supabase
    .from("screenings")
    .select(
      "bp_systolic, bp_diastolic, heart_rate, temperature_c, oxygen_saturation, height_cm, weight_kg, bmi",
    )
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
