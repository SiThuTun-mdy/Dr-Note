"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { userHasRole } from "@/lib/auth/roles"
import { generateTempPassword } from "@/lib/utils/password"
import { getSiteUrl } from "@/lib/utils/site-url"
import {
  staffOnboardingSchema,
  type StaffOnboardingInput,
} from "@/lib/validators/staff"

interface OnboardStaffResult {
  success: boolean
  staffId?: string
  /** Shown once to the admin on success — never persisted or logged. */
  tempPassword?: string
  error?: string
  fieldErrors?: Partial<Record<keyof StaffOnboardingInput, string>>
}

const GENERIC_ERROR = "Unable to create staff account. Please try again."

export async function onboardStaff(
  values: StaffOnboardingInput
): Promise<OnboardStaffResult> {
  const validated = staffOnboardingSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }
  const { name, phone, staff_code, department, role } = validated.data
  // Auth normalizes emails to lowercase; keep public.users.email identical.
  const email = validated.data.email.trim().toLowerCase()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // `users.manage` is granted to admin only (01-database-schema.md §6).
  if (!(await userHasRole(supabase, user.id, "admin"))) {
    return { success: false, error: "Unauthorized" }
  }

  // The auth signUp cannot be rolled back from here (anon key, no admin
  // API), so every check that can run first must run first: staff_code
  // uniqueness and the role id lookup both come before creating the user.
  const { data: existingCode, error: codeCheckError } = await supabase
    .from("staff_profiles")
    .select("user_id")
    .eq("staff_code", staff_code)
    .limit(1)

  if (codeCheckError) {
    console.error("[StaffOnboarding] staff_code check failed", codeCheckError)
    return { success: false, error: GENERIC_ERROR }
  }

  if (existingCode.length > 0) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { staff_code: "This staff code is already in use" },
    }
  }

  const { data: staffRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .single()

  if (!staffRole) {
    console.error(`[StaffOnboarding] "${role}" role not found`)
    return { success: false, error: GENERIC_ERROR }
  }

  // Create the auth user on a non-cookie client so this call cannot touch the
  // admin's own session (same pattern as patient registration, issue #20).
  // Unlike patients, staff DO log in — the temp password is returned once to
  // the admin. Email confirmation is on, so the confirmation email lets the
  // staff member confirm and optionally set their own password.
  const serviceClient = createServiceClient()
  const tempPassword = generateTempPassword()
  const { data: signUpData, error: signUpError } =
    await serviceClient.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/set-password`,
      },
    })

  if (signUpError || !signUpData.user) {
    if (signUpError?.message.toLowerCase().includes("already registered")) {
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { email: "This email is already registered" },
      }
    }
    console.error("[StaffOnboarding] signUp failed", signUpError)
    return { success: false, error: GENERIC_ERROR }
  }

  // With email confirmation ON, signUp does NOT error for an existing email —
  // enumeration protection returns an obfuscated user with no identities.
  // Detect that here, before any inserts run against the fake user id.
  // Detect that here, before any inserts run against the fake user id. A
  // missing identities array is treated the same way: never insert against
  // an id we cannot confirm is a freshly created user.
  if (!signUpData.user.identities || signUpData.user.identities.length === 0) {

    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { email: "This email is already registered" },
    }
  }

  const newUserId = signUpData.user.id

  const { error: usersError } = await supabase.from("users").insert({
    id: newUserId,
    name,
    email,
    phone: phone || null,
    is_active: true,
  })

  if (usersError) {
    if (usersError.code === "23505") {
      console.error(
        `[StaffOnboarding] Orphaned auth user ${newUserId}: duplicate email race on users insert`
      )
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { email: "This email is already registered" },
      }
    }
    console.error(
      `[StaffOnboarding] Orphaned auth user ${newUserId}: users insert failed`,
      usersError
    )
    return { success: false, error: GENERIC_ERROR }
  }

  const { error: profileError } = await supabase
    .from("staff_profiles")
    .insert({
      user_id: newUserId,
      staff_code,
      department,
    })

  if (profileError) {
    if (profileError.code === "23505") {
      console.error(
        `[StaffOnboarding] Orphaned auth user ${newUserId}: duplicate staff_code race`
      )
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { staff_code: "This staff code is already in use" },
      }
    }
    console.error(
      `[StaffOnboarding] Orphaned auth user ${newUserId}: staff_profiles insert failed`,
      profileError
    )
    return { success: false, error: GENERIC_ERROR }
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: newUserId,
    role_id: staffRole.id,
  })

  if (roleError) {
    console.error(
      `[StaffOnboarding] Orphaned auth user ${newUserId}: user_roles insert failed`,
      roleError
    )
    return { success: false, error: GENERIC_ERROR }
  }

  return { success: true, staffId: newUserId, tempPassword }
}
