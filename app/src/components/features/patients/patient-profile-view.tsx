"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import { updatePatientProfile, type PatientProfileData } from "@/components/features/patients/patient-profile-actions"
import {
  patientProfileUpdateSchema,
  genderOptions,
  type PatientProfileUpdateInput,
} from "@/lib/validators/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { EmergencyContactsSection } from "@/components/features/patients/emergency-contacts"

const genderLabels: Record<string, string> = { male: "Male", female: "Female", other: "Other" }

function toFormValues(data: PatientProfileData): PatientProfileUpdateInput {
  return {
    name: data.name,
    phone: data.phone ?? "",
    dob: data.dob ?? "",
    gender: (data.gender as PatientProfileUpdateInput["gender"]) ?? undefined,
    nrc: data.nrc ?? "",
    religion: data.religion ?? "",
    ethnicity: data.ethnicity ?? "",
    address: data.address ?? "",
  }
}

export function PatientProfileView({
  patientId,
  initialData,
  canEdit,
}: {
  patientId: string
  initialData: PatientProfileData
  canEdit: boolean
}) {
  const [data, setData] = useState(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Bumped after a successful save so <EmergencyContactsSection> remounts
  // with the freshly-fetched contacts instead of keeping its stale copy.
  const [contactsVersion, setContactsVersion] = useState(0)

  const form = useForm<PatientProfileUpdateInput>({
    resolver: zodResolver(patientProfileUpdateSchema),
    defaultValues: toFormValues(data),
  })

  function startEditing() {
    form.reset(toFormValues(data))
    setIsEditing(true)
  }

  async function onSubmit(values: PatientProfileUpdateInput) {
    setIsSubmitting(true)
    try {
      const result = await updatePatientProfile(patientId, values)
      if (!result.success || !result.data) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof PatientProfileUpdateInput, { message })
          }
        }
        toast.error(result.error || "Unable to save changes. Please try again.")
        return
      }
      setData(result.data)
      setContactsVersion((v) => v + 1)
      setIsEditing(false)
      toast.success("Patient profile updated")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Demographics</CardTitle>
            {canEdit && !isEditing && (
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth *</FormLabel>
                        <FormControl>
                          <Input type="date" disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {genderLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nrc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NRC (optional)</FormLabel>
                      <FormControl>
                        <Input disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion (optional)</FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ethnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnicity (optional)</FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              <ProfileField label="Date of birth" value={data.dob} />
              <ProfileField label="Gender" value={data.gender ? genderLabels[data.gender] ?? data.gender : null} />
              <ProfileField label="NRC" value={data.nrc} />
              <ProfileField label="Religion" value={data.religion} />
              <ProfileField label="Ethnicity" value={data.ethnicity} />
              <ProfileField label="Address" value={data.address} className="sm:col-span-2" />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <EmergencyContactsSection
            key={contactsVersion}
            patientId={patientId}
            initialContacts={data.emergencyContacts}
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileField({
  label,
  value,
  className,
}: {
  label: string
  value: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  )
}
