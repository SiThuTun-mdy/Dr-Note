import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { userHasRole } from "@/lib/auth/roles"
import { getStaffProfile } from "@/components/features/staff/staff-profile-actions"
import { StaffProfileView } from "@/components/features/staff/staff-profile-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminUserProfilePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // users.manage is granted to admin only (01-database-schema.md §6).
  if (!user || !(await userHasRole(supabase, user.id, "admin"))) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2">You do not have permission to view this profile.</p>
      </div>
    )
  }

  const result = await getStaffProfile(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const profile = result.data

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <Badge variant={profile.isActive ? "secondary" : "destructive"}>
              {profile.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">User ID: {profile.id}</p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/users" />}
          variant="outline"
          size="sm"
        >
          Back to users
        </Button>
      </div>
      <StaffProfileView userId={profile.id} initialData={profile} canEditWorkInfo />
    </div>
  )
}
