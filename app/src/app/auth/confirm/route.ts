import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Only redirect to routes this app actually serves post-confirmation —
// never trust an arbitrary `next` value from the URL (open-redirect).
const ALLOWED_NEXT_PATHS = new Set(["/set-password"])

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const requestedNext = searchParams.get("next")
  const next = requestedNext && ALLOWED_NEXT_PATHS.has(requestedNext) ? requestedNext : "/login"

  const redirectTo = request.nextUrl.clone()
  redirectTo.search = ""
  redirectTo.pathname = next

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  redirectTo.pathname = "/login"
  redirectTo.searchParams.set("error", "confirmation_failed")
  return NextResponse.redirect(redirectTo)
}
