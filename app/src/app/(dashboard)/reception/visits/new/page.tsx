import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VisitCreationForm } from "./visit-creation-form"

const ALLOWED_ROLES = new Set(["admin", "receptionist"])

const roleDashboard: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  nurse: "/nurse",
  receptionist: "/reception",
}

type Props = {
  searchParams: Promise<{ patientId?: string }>
}

export default async function NewVisitPage({ searchParams }: Props) {
  const params = await searchParams
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

  // Fetch patient data if patientId is provided (from patient profile "New Visit" button)
  let prefillPatient = null
  if (params.patientId) {
    const { data } = await supabase
      .from("users")
      .select("id, name, email, patient_profiles(nrc)")
      .eq("id", params.patientId)
      .maybeSingle()

    if (data) {
      const profile = data.patient_profiles as unknown as { nrc: string | null } | null
      prefillPatient = {
        id: data.id,
        name: data.name,
        email: data.email,
        nrc: profile?.nrc ?? null,
      }
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">New visit</h2>
      <VisitCreationForm prefillPatient={prefillPatient} />
    </div>
  )
}
