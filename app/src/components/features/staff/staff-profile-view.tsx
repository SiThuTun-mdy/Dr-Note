"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import {
  updateStaffProfile,
  type StaffProfileData,
} from "@/components/features/staff/staff-profile-actions"
import {
  staffProfileUpdateSchema,
  type StaffProfileUpdateInput,
} from "@/lib/validators/staff-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

function toFormValues(data: StaffProfileData): StaffProfileUpdateInput {
  return {
    name: data.name,
    phone: data.phone ?? "",
    staff_code: data.staffCode ?? "",
    department: data.department ?? "",
  }
}

export function StaffProfileView({
  userId,
  initialData,
  canEditWorkInfo,
}: {
  userId: string
  initialData: StaffProfileData
  /** Admins may edit staff code and department; everyone edits own name/phone. */
  canEditWorkInfo: boolean
}) {
  const [data, setData] = useState(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StaffProfileUpdateInput>({
    resolver: zodResolver(staffProfileUpdateSchema),
    defaultValues: toFormValues(data),
  })

  function startEditing() {
    form.reset(toFormValues(data))
    setIsEditing(true)
  }

  async function onSubmit(values: StaffProfileUpdateInput) {
    setIsSubmitting(true)
    try {
      const result = await updateStaffProfile(userId, values)
      if (!result.success || !result.data) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof StaffProfileUpdateInput, { message })
          }
        }
        toast.error(result.error || "Unable to save changes. Please try again.")
        return
      }
      setData(result.data)
      setIsEditing(false)
      toast.success("Profile updated")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile</CardTitle>
          {!isEditing && (
            <Button type="button" variant="outline" size="sm" onClick={startEditing}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canEditWorkInfo && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staff_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff code</FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-left gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
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
