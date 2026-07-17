import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { userHasRole } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Add Staff",
  description: "Onboard a new staff member",
}
import { StaffOnboardingForm } from "./staff-onboarding-form"

export default async function NewStaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Defense in depth — middleware already limits /admin to admins, the
  // server action re-checks, and RLS backs both up. Non-admins landing here
  // are bounced back through middleware, which routes them to their own
  // dashboard.
  if (!(await userHasRole(supabase, user.id, "admin"))) {
    redirect("/login")
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Add staff member</h1>
      <StaffOnboardingForm />
    </div>
  )
}
