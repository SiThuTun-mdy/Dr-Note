"use server"

import { createClient } from "@/lib/supabase/server"

export interface GetPatientRegistrationCountResult {
  count: number | null
  error: string | null
}

/**
 * Counts patients registered on a given day, joining patient_profiles →
 * users and filtering on users.created_at (registration timestamp).
 * Defaults to today when no date is provided.
 */
export async function getPatientRegistrationCount(
  date: Date = new Date()
): Promise<GetPatientRegistrationCountResult> {
  const supabase = await createClient()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const { count, error } = await supabase
    .from("patient_profiles")
    .select("user_id, users!inner(created_at)", {
      count: "exact",
      head: true,
    })
    .gte("users.created_at", startOfDay.toISOString())
    .lt("users.created_at", endOfDay.toISOString())

  if (error) {
    console.error("[Reception] Failed to fetch registration count", error)
    return { count: null, error: "Failed to fetch registration count" }
  }

  return { count: count ?? 0, error: null }
}
