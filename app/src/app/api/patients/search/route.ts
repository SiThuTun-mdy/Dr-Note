import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ patients: [] })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get patient role ID
  const { data: patientRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "patient")
    .maybeSingle()

  if (!patientRole) {
    return NextResponse.json({ patients: [] })
  }

  // Get patient user IDs
  const { data: assignments } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role_id", patientRole.id)

  const patientIds = [...new Set((assignments ?? []).map((r) => r.user_id))]

  if (patientIds.length === 0) {
    return NextResponse.json({ patients: [] })
  }

  // Search patients by name, email, or phone
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone")
    .in("id", patientIds)
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .order("name", { ascending: true })
    .limit(20)

  if (error) {
    console.error("[PatientSearch] query failed", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }

  return NextResponse.json({ patients: data ?? [] })
}
