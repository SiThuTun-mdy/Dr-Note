"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { screeningSchema, type ScreeningInput } from "@/lib/validators/screening"
import { transitionVisitStatus } from "@/app/(dashboard)/queue/actions"

interface ScreeningResult {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof ScreeningInput, string>>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Create a screening record for a visit and advance status → with_doctor.
 * Exactly one screening per visit (UNIQUE constraint on screenings.visit_id).
 */
export async function createScreening(
  visitId: string,
  values: ScreeningInput
): Promise<ScreeningResult> {
  // 1. Validate visit ID format
  if (!visitId || !UUID_RE.test(visitId)) {
    return { success: false, error: "Invalid visit ID" }
  }

  // 2. Validate input
  const validated = screeningSchema.safeParse(values)
  if (!validated.success) {
    const fieldErrors: Partial<Record<keyof ScreeningInput, string>> = {}
    for (const issue of validated.error.issues) {
      const key = issue.path[0] as keyof ScreeningInput
      fieldErrors[key] = issue.message
    }
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const data = validated.data
  const supabase = await createClient()

  // 3. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // 4. Permission check + visit fetch + existing screening check (parallel reads)
  const [permResult, visitResult, existingResult] = await Promise.all([
    supabase.rpc("has_permission", { perm: "screenings.create" }),
    supabase
      .from("visits")
      .select("id, status, doctor_id")
      .eq("id", visitId)
      .single(),
    supabase
      .from("screenings")
      .select("id")
      .eq("visit_id", visitId)
      .limit(1),
  ])

  // Permission
  if (permResult.error) {
    console.error("[Screening] Permission check failed", permResult.error)
    return { success: false, error: "Unable to verify permissions. Please try again." }
  }
  if (!permResult.data) {
    return { success: false, error: "You do not have permission to create screenings" }
  }

  // Visit
  if (visitResult.error || !visitResult.data) {
    return { success: false, error: "Visit not found" }
  }
  const visit = visitResult.data

  // 5. Check visit status
  if (visit.status !== "screening" && visit.status !== "waiting") {
    return {
      success: false,
      error: `This visit is currently "${visit.status}" and cannot accept screening data.`,
    }
  }

  // 6. Duplicate guard
  if (existingResult.data && existingResult.data.length > 0) {
    return {
      success: false,
      error: "A screening has already been recorded for this visit.",
    }
  }

  // 7. Doctor must be assigned before advancing to with_doctor
  if (!visit.doctor_id) {
    return {
      success: false,
      error: "No doctor has been assigned to this visit yet. Please assign a doctor first.",
    }
  }

  // 8. Insert screening (bmi is auto-computed by the DB generated column)
  const { error: insertError } = await supabase.from("screenings").insert({
    visit_id: visitId,
    height_cm: data.height_cm,
    weight_kg: data.weight_kg,
    bp_systolic: data.bp_systolic,
    bp_diastolic: data.bp_diastolic,
    heart_rate: data.heart_rate,
    temperature_c: data.temperature_c,
    oxygen_saturation: data.oxygen_saturation,
    screened_by: user.id,
  })

  if (insertError) {
    console.error("[Screening] Insert failed", insertError)
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "A screening has already been recorded for this visit.",
      }
    }
    return { success: false, error: "Failed to save screening. Please try again." }
  }

  // 9. Advance visit status via centralized transition logic
  //    If visit is 'waiting', two-step: waiting→screening→with_doctor
  //    If visit is 'screening', one-step: screening→with_doctor
  if (visit.status === "waiting") {
    const r1 = await transitionVisitStatus(visitId, "screening")
    if (!r1.success) {
      console.error("[Screening] Failed to advance to screening", r1.error)
      // Screening saved but status stuck — nurse can retry from queue
      return {
        success: true,
        error: "Screening saved, but failed to update visit status. Please refresh the queue.",
      }
    }
  }

  const r2 = await transitionVisitStatus(visitId, "with_doctor")
  if (!r2.success) {
    console.error("[Screening] Failed to advance to with_doctor", r2.error)
    return {
      success: true,
      error: "Screening saved, but failed to update visit status. Please refresh the queue.",
    }
  }

  revalidatePath("/queue")
  return { success: true }
}
