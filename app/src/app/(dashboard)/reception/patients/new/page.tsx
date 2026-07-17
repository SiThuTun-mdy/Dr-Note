import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientRegistrationForm } from "./patient-registration-form"

export const metadata: Metadata = {
  title: "Patient Registration",
  description: "Register a new patient",
}

const ALLOWED_ROLES = new Set(["admin", "receptionist"])

const roleDashboard: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  nurse: "/nurse",
  receptionist: "/reception",
}

export default async function NewPatientPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const roleName =
    (roles?.[0] as unknown as { roles: { name: string } | null } | undefined)
      ?.roles?.name ?? null

  // Defense in depth — the server action re-checks this, and RLS backs both up.
  if (!roleName || !ALLOWED_ROLES.has(roleName)) {
    redirect(roleDashboard[roleName ?? ""] || "/login")
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Patient Registration</h1>
      <PatientRegistrationForm />
    </div>
  )
}
