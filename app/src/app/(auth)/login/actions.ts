"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, type LoginInput } from "@/lib/validators/auth"

// Rate limiting: simple in-memory store for demo (production should use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

interface LoginResult {
  error?: string
}

interface UserRoleRow {
  roles: { name: string } | null
}

export async function login(values: LoginInput): Promise<LoginResult> {
  // Validate input with Zod
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid input. Please check your email and password." }
  }

  const { email, password } = validatedFields.data

  // Rate limiting check
  const attempts = loginAttempts.get(email)
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    if (Date.now() < attempts.resetAt) {
      const minutesLeft = Math.ceil((attempts.resetAt - Date.now()) / 60000)
      return {
        error: `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
      }
    }
    loginAttempts.delete(email)
  }

  const supabase = await createClient()

  // Attempt to sign in
  // NOTE: Supabase Auth has built-in rate limiting on /auth/v1/token endpoint.
  // The above application-layer rate limiting provides defense-in-depth.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Track failed attempt
    const current = loginAttempts.get(email) || { count: 0, resetAt: 0 }
    loginAttempts.set(email, {
      count: current.count + 1,
      resetAt: Date.now() + LOCKOUT_MS,
    })

    // Human-friendly error messages (never raw Supabase codes)
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Wrong email or password. Please try again." }
    }
    // New accounts (staff onboarding, patient registration) cannot sign in —
    // even with the correct password — until the confirmation email is
    // clicked. Masking this as a wrong-password error sends people down the
    // wrong debugging path.
    if (
      error.code === "email_not_confirmed" ||
      error.message.includes("Email not confirmed")
    ) {
      return {
        error:
          "This email hasn't been confirmed yet. Open the confirmation link we emailed you, then log in.",
      }
    }
    return { error: "Unable to sign in. Please try again later." }
  }

  // Clear failed attempts on successful login
  loginAttempts.delete(email)

  // Check if user is active
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", data.user.id)
      .single()

    if (userError || !userData) {
      // Log orphaned auth user for debugging
      console.error(
        `[Auth] Orphaned auth user: ${data.user.id} has no public.users row`
      )
      await supabase.auth.signOut()
      return { error: "Account not found. Please contact administration." }
    }

    if (!userData.is_active) {
      // Sign out inactive users
      await supabase.auth.signOut()
      return {
        error:
          "This account has been deactivated. Please contact administration.",
      }
    }
  }

  // Fetch user roles for redirect
  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", data.user.id)

  // Determine redirect path based on primary role
  const roleRow = roles?.[0] as UserRoleRow | undefined
  const primaryRole = roleRow?.roles?.name

  if (!primaryRole) {
    // No assigned role — deny access (FIND-001: no default to admin)
    console.error(
      `[Auth] User ${data.user.id} has no assigned role in user_roles`
    )
    await supabase.auth.signOut()
    return {
      error: "Your account has no assigned role. Please contact administration.",
    }
  }

  const redirectMap: Record<string, string> = {
    admin: "/admin",
    doctor: "/doctor",
    nurse: "/nurse",
    receptionist: "/reception",
    patient: "/patient",
  }

  // Redirect to role-specific dashboard or error if invalid role
  const target = redirectMap[primaryRole]
  if (!target) {
    console.error(`[Auth] Unknown role "${primaryRole}" for user ${data.user.id}`)
    await supabase.auth.signOut()
    return { error: "Invalid account role. Please contact administration." }
  }

  redirect(target)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
