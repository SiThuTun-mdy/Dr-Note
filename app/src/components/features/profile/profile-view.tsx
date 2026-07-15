"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import { type StaffProfileData } from "@/components/features/profile/profile-actions"
import { ProfileEditForm } from "@/components/features/profile/profile-edit-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatMemberSince(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function StaffProfileView({
  userId,
  initialData,
  canEditWorkInfo,
}: {
  userId: string
  initialData: StaffProfileData
  /** Admins may edit the staff code; everyone edits own name/phone/department. */
  canEditWorkInfo: boolean
}) {
  const [data, setData] = useState(initialData)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile</CardTitle>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <ProfileEditForm
            userId={userId}
            data={data}
            canEditWorkInfo={canEditWorkInfo}
            onSaved={(updated) => {
              setData(updated)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl">
            <ProfileField label="Full name" value={data.name} />
            <ProfileField label="Email" value={data.email} />
            <ProfileField label="Phone" value={data.phone} />
            <ProfileField label="Staff code" value={data.staffCode} />
            <ProfileField label="Department" value={data.department} />
            <div>
              <dt className="text-xs text-muted-foreground">Roles</dt>
              <dd className="flex flex-wrap gap-1 mt-1">
                {data.roles.length > 0 ? (
                  data.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="capitalize">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm font-medium">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge variant={data.isActive ? "secondary" : "destructive"}>
                  {data.isActive ? "Active" : "Inactive"}
                </Badge>
              </dd>
            </div>
            <ProfileField
              label="Member since"
              value={formatMemberSince(data.memberSince)}
            />
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

function ProfileField({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  )
}
