import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getUserRoles } from "@/lib/auth/roles"
import { getStaffProfile } from "@/components/features/profile/profile-actions"

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your personal details",
}
import { StaffProfileView } from "@/components/features/profile/profile-view"
import { ProfileError } from "@/components/features/profile/profile-error"

export default async function MyProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2">You must be logged in to view your profile.</p>
      </div>
    )
  }

  const result = await getStaffProfile(user.id)

  if (!result.success || !result.data) {
    return (
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My profile</h1>
          <p className="text-sm text-muted-foreground">
            View and update your personal details.
          </p>
        </div>
        <ProfileError message={"we couldn't load your profile right now."} />
      </div>
    )
  }

  const roles = await getUserRoles(supabase, user.id)

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My profile</h1>
        <p className="text-sm text-muted-foreground">
          View and update your personal details.
        </p>
      </div>
      <StaffProfileView
        userId={user.id}
        initialData={result.data}
        canEditWorkInfo={roles.includes("admin")}
      />
    </div>
  )
}
