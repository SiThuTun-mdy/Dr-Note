import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * A throwaway Supabase client for creating auth users on behalf of someone
 * else (e.g. a receptionist registering a patient, an admin onboarding
 * staff). Unlike the cookie-bound server client, this one never persists a
 * session or touches request cookies, so calling `auth.signUp` here cannot
 * clobber the caller's own logged-in session. Anon key only — no
 * service-role key (see docs/12-Architecture.md §3).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
