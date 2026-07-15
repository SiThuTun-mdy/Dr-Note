"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserRoles } from "@/lib/auth/roles"
import {
  staffProfileUpdateSchema,
  type StaffProfileUpdateInput,
} from "@/lib/validators/staff-profile"

export interface StaffProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  staffCode: string | null
  department: string | null
  isActive: boolean
  roles: string[]
}

interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Partial<Record<keyof StaffProfileUpdateInput, string>>
}

interface StaffProfileRow {
  id: string
  name: string
  email: string
  phone: string | null
  is_active: boolean
  staff_profiles:
    | { staff_code: string; department: string | null }
    | { staff_code: string; department: string | null }[]
    | null
  user_roles: { roles: { name: string } | null }[]
}

// staff_profiles is a 1:1 embed but PostgREST may return object or array
// depending on how the relationship is detected.
function normalizeStaffProfile(row: StaffProfileRow): StaffProfileData {
  const profile = Array.isArray(row.staff_profiles)
    ? row.staff_profiles[0] ?? null
    : row.staff_profiles

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    staffCode: profile?.staff_code ?? null,
    department: profile?.department ?? null,
    isActive: row.is_active,
    roles: (row.user_roles ?? [])
      .map((ur) => ur.roles?.name)
      .filter((name): name is string => !!name),
  }
}

async function fetchStaffProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ data: StaffProfileData | null; error: unknown }> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, is_active, staff_profiles(staff_code, department), user_roles(roles(name))"
    )
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return { data: null, error }
  return { data: normalizeStaffProfile(data as unknown as StaffProfileRow), error: null }
}

/**
 * Fetch a staff profile. Users may read their own profile; admins
 * (users.manage, 01-database-schema.md §6) may read anyone's.
 */
export async function getStaffProfile(
  userId: string
): Promise<ActionResult<StaffProfileData>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  if (user.id !== userId) {
    const roles = await getUserRoles(supabase, user.id)
    if (!roles.includes("admin")) {
      return { success: false, error: "Unauthorized" }
    }
  }

  const { data, error } = await fetchStaffProfile(supabase, userId)
  if (!data) {
    if (error) console.error("[StaffProfile] fetch failed", error)
    return { success: false, error: "Unable to load this profile." }
  }

  return { success: true, data }
}

/**
 * Update a staff profile. Users may update their own name/phone; admins may
 * also update anyone's work fields (staff code, department).
 */
export async function updateStaffProfile(
  userId: string,
  values: StaffProfileUpdateInput
): Promise<ActionResult<StaffProfileData>> {
  const validated = staffProfileUpdateSchema.safeParse(values)
  if (!validated.success) {
    const fieldErrors: Partial<Record<keyof StaffProfileUpdateInput, string>> = {}
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as keyof StaffProfileUpdateInput
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const isSelf = user.id === userId
  const roles = await getUserRoles(supabase, user.id)
  const isAdmin = roles.includes("admin")

  if (!isSelf && !isAdmin) {
    return { success: false, error: "Unauthorized" }
  }

  const { name, phone, staff_code, department } = validated.data

  const { data: updatedUser, error: userError } = await supabase
    .from("users")
    .update({ name, phone: phone || null })
    .eq("id", userId)
    .select("id")
    .maybeSingle()

  if (userError || !updatedUser) {
    console.error("[StaffProfile] users update failed", userError)
    return { success: false, error: "Unable to save changes. Please try again." }
  }

  // Work fields are admin-managed (users.manage). Non-admin submissions
  // never touch staff_profiles, even for their own row.
  if (isAdmin && staff_code) {
    const { error: profileError } = await supabase
      .from("staff_profiles")
      .upsert(
        { user_id: userId, staff_code, department: department || null },
        { onConflict: "user_id" }
      )

    if (profileError) {
      if (profileError.code === "23505") {
        return {
          success: false,
          error: "Please fix the highlighted fields.",
          fieldErrors: { staff_code: "This staff code is already in use" },
        }
      }
      console.error("[StaffProfile] staff_profiles upsert failed", profileError)
      return { success: false, error: "Unable to save changes. Please try again." }
    }
  }

  const { data, error } = await fetchStaffProfile(supabase, userId)
  if (!data) {
    console.error("[StaffProfile] refetch after update failed", error)
    return { success: false, error: "Saved, but could not refresh the page. Please reload." }
  }

  return { success: true, data }
}
