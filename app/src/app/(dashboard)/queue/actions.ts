"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VisitStatus = "waiting" | "screening" | "with_doctor" | "completed"

export interface VisitRow {
  id: string
  patient_id: string
  doctor_id: string | null
  receptionist_id: string | null
  visit_type: string | null
  chief_complaint: string | null
  status: VisitStatus
  visit_date: string
  created_at: string
  patient_name: string
  doctor_name: string | null
}

export interface GetTodayVisitsResult {
  data: VisitRow[] | null
  error: string | null
  userRole: string | null
}

export interface TransitionResult {
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Forward-only status lifecycle
// ---------------------------------------------------------------------------

/** Allowed next statuses for each current status. */
const VALID_TRANSITIONS: Record<VisitStatus, VisitStatus[]> = {
  waiting: ["screening"],
  screening: ["with_doctor"],
  with_doctor: ["completed"],
  completed: [],
}

/**
 * Role → allowed (fromStatus, toStatus) pairs.
 * Nurses start screening; doctors start consult and complete.
 */
const ROLE_TRANSITIONS: Record<string, Array<[VisitStatus, VisitStatus]>> = {
  nurse: [
    ["waiting", "screening"],
    ["screening", "with_doctor"], // screening form: record vitals + hand off
  ],
  doctor: [
    ["screening", "with_doctor"],
    ["with_doctor", "completed"],
  ],
  admin: [
    ["waiting", "screening"],
    ["screening", "with_doctor"],
    ["with_doctor", "completed"],
  ],
}

// ---------------------------------------------------------------------------
// Fetch today's visits
// ---------------------------------------------------------------------------

export async function getTodayVisits(): Promise<GetTodayVisitsResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated", userRole: null }

  // Determine caller's role
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const userRole =
    (
      (userRoles?.[0] as unknown as { roles: { name: string } | null })
        ?.roles?.name ?? null
    )

  // Today's date range (local midnight → next midnight)
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Fetch today's visits
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select(
      `
        id,
        patient_id,
        doctor_id,
        receptionist_id,
        visit_type,
        chief_complaint,
        status,
        visit_date,
        created_at
      `
    )
    .gte("visit_date", startOfDay.toISOString())
    .lt("visit_date", endOfDay.toISOString())
    .order("created_at", { ascending: true })

  if (visitsError) {
    console.error("[Queue] Failed to fetch visits", visitsError)
    return { data: null, error: "Failed to fetch queue", userRole }
  }

  // Fetch patient and doctor names separately
  const patientIds = [...new Set((visits || []).map(v => v.patient_id))]
  const doctorIds = [...new Set((visits || []).filter(v => v.doctor_id).map(v => v.doctor_id))]

  const [patientsResult, doctorsResult] = await Promise.all([
    patientIds.length > 0
      ? supabase.from("users").select("id, name").in("id", patientIds)
      : { data: [] },
    doctorIds.length > 0
      ? supabase.from("users").select("id, name").in("id", doctorIds)
      : { data: [] },
  ])

  const patientMap = new Map((patientsResult.data || []).map(p => [p.id, p.name]))
  const doctorMap = new Map((doctorsResult.data || []).map(d => [d.id, d.name]))

  const rows: VisitRow[] = (visits || []).map((v) => ({
    id: v.id,
    patient_id: v.patient_id,
    doctor_id: v.doctor_id,
    receptionist_id: v.receptionist_id,
    visit_type: v.visit_type,
    chief_complaint: v.chief_complaint,
    status: v.status as VisitStatus,
    visit_date: v.visit_date,
    created_at: v.created_at,
    patient_name: patientMap.get(v.patient_id) ?? "Unknown",
    doctor_name: v.doctor_id ? doctorMap.get(v.doctor_id) ?? null : null,
  }))

  return { data: rows, error: null, userRole }
}

// ---------------------------------------------------------------------------
// Transition visit status (server-validated, forward-only)
// ---------------------------------------------------------------------------

export async function transitionVisitStatus(
  visitId: string,
  targetStatus: VisitStatus
): Promise<TransitionResult> {
  if (!visitId || !targetStatus) {
    return { success: false, error: "Missing visit ID or target status" }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // Defense-in-depth: check permission (RLS also enforces this)
  const { data: hasPerm } = await supabase.rpc("has_permission", {
    perm: "visits.update_status",
  })
  if (!hasPerm) {
    return { success: false, error: "You do not have permission to update visit status" }
  }

  // Determine caller's role
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const userRole =
    (userRoles?.[0] as unknown as { roles: { name: string } | null })
      ?.roles?.name ?? null

  if (!userRole) {
    return { success: false, error: "Unable to determine your role" }
  }

  // Fetch the current visit
  const { data: visit, error: fetchError } = await supabase
    .from("visits")
    .select("id, status, doctor_id")
    .eq("id", visitId)
    .single()

  if (fetchError || !visit) {
    return { success: false, error: "Visit not found" }
  }

  const currentStatus = visit.status as VisitStatus

  // 1. Validate forward-only transition
  const allowedNext = VALID_TRANSITIONS[currentStatus]
  if (!allowedNext.includes(targetStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${currentStatus} → ${targetStatus}`,
    }
  }

  // 2. Validate role is allowed for this specific transition
  const roleAllowed = ROLE_TRANSITIONS[userRole] ?? []
  const isAllowed = roleAllowed.some(
    ([from, to]) => from === currentStatus && to === targetStatus
  )
  if (!isAllowed) {
    return {
      success: false,
      error: `Your role (${userRole}) cannot perform this transition`,
    }
  }

  // 3. When moving to with_doctor, a doctor must be assigned
  if (targetStatus === "with_doctor" && !visit.doctor_id) {
    return {
      success: false,
      error: "No doctor has been assigned to this visit",
    }
  }

  // 4. Perform the update
  const { error: updateError } = await supabase
    .from("visits")
    .update({ status: targetStatus })
    .eq("id", visitId)

  if (updateError) {
    console.error("[Queue] Status update failed", updateError)
    return { success: false, error: "Failed to update visit status. Please try again." }
  }

  revalidatePath("/queue")
  return { success: true }
}
