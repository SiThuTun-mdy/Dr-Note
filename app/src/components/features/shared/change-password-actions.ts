"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators/auth"

interface ChangePasswordResult {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof ChangePasswordInput, string>>
}

export async function changePassword(
  values: ChangePasswordInput
): Promise<ChangePasswordResult> {
  const validated = changePasswordSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }
  const { currentPassword, password } = validated.data

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { success: false, error: "Your session has expired. Please log in again." }
  }

  // Supabase's updateUser does not re-check the old password, so verify it
  // ourselves first. Use the non-cookie service client so this throwaway
  // sign-in cannot touch the user's real session (same pattern as
  // registration flows). Supabase's own auth rate limiting applies here,
  // which also throttles brute-forcing the current password.
  const serviceClient = createServiceClient()
  const { error: verifyError } = await serviceClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { currentPassword: "Current password is incorrect" },
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) {
    console.error(`[ChangePassword] updateUser failed for user ${user.id}`, updateError)
    return { success: false, error: "Unable to change your password. Please try again." }
  }

  return { success: true }
}
