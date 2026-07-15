"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  updateStaffProfile,
  type StaffProfileData,
} from "@/components/features/profile/profile-actions"
import {
  staffProfileUpdateSchema,
  type StaffProfileUpdateInput,
} from "@/lib/validators/profile"
import { DepartmentSelect } from "@/components/features/shared/department-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function ProfileEditForm({
  userId,
  data,
  canEditWorkInfo,
  onSaved,
  onCancel,
}: {
  userId: string
  data: StaffProfileData
  /** Admins may edit the staff code; everyone edits own name/phone/department. */
  canEditWorkInfo: boolean
  onSaved: (data: StaffProfileData) => void
  onCancel: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StaffProfileUpdateInput>({
    resolver: zodResolver(staffProfileUpdateSchema),
    defaultValues: toFormValues(data),
  })

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
      onSaved(result.data)
      toast.success("Profile updated")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

        <div className="grid grid-cols-2 gap-4">
          {canEditWorkInfo && (
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
          )}

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department (optional)</FormLabel>
                <DepartmentSelect
                  disabled={isSubmitting}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
