"use server"

import { createClient } from "@/lib/supabase/server"
import { setPasswordSchema, type SetPasswordInput } from "@/lib/validators/auth"

interface SetPasswordResult {
  success: boolean
  error?: string
}

export async function setPassword(values: SetPasswordInput): Promise<SetPasswordResult> {
  const validated = setPasswordSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "This link has expired. Please ask the clinic to resend it." }
  }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  })

  if (error) {
    console.error("[SetPassword] updateUser failed", error)
    return { success: false, error: "Unable to set your password. Please try again." }
  }

  await supabase.auth.signOut()
  return { success: true }
}
