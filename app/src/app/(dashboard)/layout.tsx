import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardShell } from "./shell"

const roleDashboard: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  nurse: "/nurse",
  receptionist: "/reception",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile and role
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .single()

  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const roleName =
    (roles?.[0] as unknown as { roles: { name: string } | null })?.roles?.name || "unknown"

  // Double-check role access (defense in depth — middleware also guards).
  // Patients have no shared dashboard; their landing page is their own record.
  const allowedPrefix =
    roleName === "patient" ? `/patients/${user.id}` : roleDashboard[roleName]
  if (!allowedPrefix) {
    redirect("/login")
  }

  return (
    <DashboardShell
      userName={profile?.name || user.email || ""}
      userRole={roleName}
      dashboardUrl={allowedPrefix}
    >
      {children}
    </DashboardShell>
  )
}
