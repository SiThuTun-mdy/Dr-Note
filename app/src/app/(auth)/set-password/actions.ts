"use server"

import { createClient } from "@/lib/supabase/server"
import { setPasswordSchema, type SetPasswordInput } from "@/lib/validators/auth"

interface SetPasswordResult {
  success: boolean
  error?: string
  /**
   * Whether this account can use /login afterwards. Staff roles have
   * dashboards; patients don't yet (no patient dashboard this sprint), so
   * their success screen must not point them at the login page.
   */
  canLogin?: boolean
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

  // Staff land on a role dashboard after login; patients have none yet, so
  // only non-patient roles should be sent to /login from the success screen.
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)

  const canLogin =
    roleRows?.some((row) => {
      const roleName = (row as unknown as { roles: { name: string } | null })
        .roles?.name
      return !!roleName && roleName !== "patient"
    }) ?? false

  await supabase.auth.signOut()
  return { success: true, canLogin }
}
