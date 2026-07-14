"use server"

import { createClient } from "@/lib/supabase/server"
import type { DiagnosisBadge } from "@/types/visit"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VisitHistoryRow {
  id: string
  patient_id: string
  doctor_id: string | null
  status: string
  chief_complaint: string | null
  diagnosis_note: string | null
  visit_date: string
  created_at: string
  doctor_name: string | null
  diagnoses: DiagnosisBadge[]
  has_prescription: boolean
}

export interface PatientHistoryResult {
  data: VisitHistoryRow[] | null
  error: string | null
}

// ---------------------------------------------------------------------------
// Fetch patient visit history (all visits for a patient)
// ---------------------------------------------------------------------------

export async function getPatientHistory(
  patientId: string
): Promise<PatientHistoryResult> {
  if (!patientId) {
    return { data: null, error: "Patient ID is required" }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  // Fetch visits for the patient (RLS handles access control)
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select(
      `
        id,
        patient_id,
        doctor_id,
        status,
        chief_complaint,
        diagnosis_note,
        visit_date,
        created_at
      `
    )
    .eq("patient_id", patientId)
    .order("visit_date", { ascending: false })

  if (visitsError) {
    console.error("[History] Failed to fetch visits", visitsError)
    return { data: null, error: "Failed to fetch patient history" }
  }

  if (!visits || visits.length === 0) {
    return { data: [], error: null }
  }

  // Fetch doctor names
  const doctorIds = [
    ...new Set(visits.filter((v) => v.doctor_id).map((v) => v.doctor_id!)),
  ]
  const { data: doctors } =
    doctorIds.length > 0
      ? await supabase.from("users").select("id, name").in("id", doctorIds)
      : { data: [] }

  const doctorMap = new Map(
    (doctors || []).map((d) => [d.id, d.name])
  )

  // Fetch diagnoses for all visits in one query (no N+1)
  const visitIds = visits.map((v) => v.id)
  const { data: visitDiagnoses } = await supabase
    .from("visit_diagnoses")
    .select(
      `
        visit_id,
        diagnosis_type,
        diagnoses(code, title)
      `
    )
    .in("visit_id", visitIds)

  // Group diagnoses by visit_id
  const diagnosesByVisit = new Map<string, DiagnosisBadge[]>()
  for (const vd of visitDiagnoses || []) {
    const visitId = vd.visit_id
    if (!diagnosesByVisit.has(visitId)) {
      diagnosesByVisit.set(visitId, [])
    }
    const diagnosis = vd.diagnoses as unknown as {
      code: string
      title: string
    } | null
    if (diagnosis) {
      diagnosesByVisit.get(visitId)!.push({
        code: diagnosis.code,
        title: diagnosis.title,
        type: vd.diagnosis_type as "primary" | "secondary" | "suspected",
      })
    }
  }

  // Check which visits have prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("visit_id")
    .in("visit_id", visitIds)

  const visitsWithPrescription = new Set(
    (prescriptions || []).map((p) => p.visit_id)
  )

  // Assemble the result
  const rows: VisitHistoryRow[] = visits.map((v) => ({
    id: v.id,
    patient_id: v.patient_id,
    doctor_id: v.doctor_id,
    status: v.status,
    chief_complaint: v.chief_complaint,
    diagnosis_note: v.diagnosis_note,
    visit_date: v.visit_date,
    created_at: v.created_at,
    doctor_name: v.doctor_id ? doctorMap.get(v.doctor_id) ?? null : null,
    diagnoses: diagnosesByVisit.get(v.id) || [],
    has_prescription: visitsWithPrescription.has(v.id),
  }))

  return { data: rows, error: null }
}
