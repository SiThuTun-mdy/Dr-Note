"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { generateTempPassword } from "@/lib/utils/password"
import { getSiteUrl } from "@/lib/utils/site-url"
import {
  patientRegistrationSchema,
  type PatientRegistrationInput,
} from "@/lib/validators/patient"

// Roles allowed to register patients (seed matrix, 01-database-schema.md §6:
// `patients.create` is granted to admin + receptionist only).
const ALLOWED_ROLES = new Set(["admin", "receptionist"])

interface RegisterPatientResult {
  success: boolean
  patientId?: string
  /**
   * Whether the set-password email reached Supabase. Registration itself
   * succeeded even when this is false — the receptionist just needs to
   * resend the link instead of the patient waiting on an email.
   */
  emailSent?: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof PatientRegistrationInput, string>>
}

async function getCurrentRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)
    .limit(1)

  return (
    (data?.[0] as unknown as { roles: { name: string } | null } | undefined)
      ?.roles?.name ?? null
  )
}

export async function registerPatient(
  values: PatientRegistrationInput
): Promise<RegisterPatientResult> {
  const validated = patientRegistrationSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }
  const { name, email, phone, dob, gender, nrc, religion, ethnicity, address } =
    validated.data

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const role = await getCurrentRole(supabase, user.id)
  if (!role || !ALLOWED_ROLES.has(role)) {
    return { success: false, error: "Unauthorized" }
  }

  // Create the auth user on a non-cookie client so this call cannot touch
  // the receptionist's own session (docs/guide/01-database-schema.md,
  // issue #20 context). The temp password is random and never surfaced —
  // the patient sets their own via the set-password email sent below.
  // (emailRedirectTo only matters while email confirmation is ON; with it
  // OFF Supabase sends no confirmation email, hence the explicit recovery
  // email after registration completes.)
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
    console.error("[PatientRegistration] signUp failed", signUpError)
    return { success: false, error: "Unable to register patient. Please try again." }
  }

  const newUserId = signUpData.user.id

  const { data: patientRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "patient")
    .single()

  if (!patientRole) {
    console.error(
      `[PatientRegistration] Orphaned auth user ${newUserId}: "patient" role not found`
    )
    return { success: false, error: "Unable to register patient. Please try again." }
  }

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
        `[PatientRegistration] Orphaned auth user ${newUserId}: duplicate email race on users insert`
      )
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { email: "This email is already registered" },
      }
    }
    console.error(
      `[PatientRegistration] Orphaned auth user ${newUserId}: users insert failed`,
      usersError
    )
    return { success: false, error: "Unable to register patient. Please try again." }
  }

  const { error: profileError } = await supabase.from("patient_profiles").insert({
    user_id: newUserId,
    nrc: nrc || null,
    dob,
    gender,
    religion: religion || null,
    ethnicity: ethnicity || null,
    address: address || null,
  })

  if (profileError) {
    console.error(
      `[PatientRegistration] Orphaned auth user ${newUserId}: patient_profiles insert failed`,
      profileError
    )
    return { success: false, error: "Unable to register patient. Please try again." }
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: newUserId,
    role_id: patientRole.id,
  })

  if (roleError) {
    console.error(
      `[PatientRegistration] Orphaned auth user ${newUserId}: user_roles insert failed`,
      roleError
    )
    return { success: false, error: "Unable to register patient. Please try again." }
  }

  // Identity provisioning: email the patient a link to set their own
  // password. A recovery email is used (not the signup confirmation) because
  // it is sent regardless of the project's email-confirmation setting, and
  // works with the anon key (docs/12-Architecture.md §3: no service-role key
  // in app code). The link lands on /auth/confirm which verifies the OTP and
  // forwards to /set-password with a session.
  const { error: emailError } = await serviceClient.auth.resetPasswordForEmail(
    email,
    { redirectTo: `${getSiteUrl()}/auth/confirm?next=/set-password` }
  )

  if (emailError) {
    // Registration is already complete — don't fail the whole flow over a
    // transient email problem; surface it so the receptionist can resend.
    console.error(
      `[PatientRegistration] set-password email failed for user ${newUserId}`,
      emailError
    )
    return { success: true, patientId: newUserId, emailSent: false }
  }

  return { success: true, patientId: newUserId, emailSent: true }
}
