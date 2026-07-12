"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { registerPatient } from "./actions"
import {
  patientRegistrationSchema,
  type PatientRegistrationInput,
} from "@/lib/validators/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export function PatientRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientId, setPatientId] = useState<string | null>(null)
  const registered = !!patientId

  const form = useForm<PatientRegistrationInput>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      gender: undefined,
      nrc: "",
      religion: "",
      ethnicity: "",
      address: "",
    },
  })

  async function onSubmit(values: PatientRegistrationInput) {
    setIsSubmitting(true)
    try {
      const result = await registerPatient(values)

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof PatientRegistrationInput, { message })
          }
        }
        toast.error(result.error || "Unable to register patient. Please try again.")
        return
      }

      toast.success("Patient registered")
      setPatientId(result.patientId ?? null)
    } catch (err) {
      if (isRedirectError(err)) throw err
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Aung Aung"
                    disabled={isSubmitting || registered}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="patient@example.com"
                    disabled={isSubmitting || registered}
                    {...field}
                  />
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
                  <Input
                    placeholder="09xxxxxxxxx"
                    disabled={isSubmitting || registered}
                    {...field}
                  />
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
                    <Input type="date" disabled={isSubmitting || registered} {...field} />
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
                    disabled={isSubmitting || registered}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                  <Input disabled={isSubmitting || registered} {...field} />
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
                    <Input disabled={isSubmitting || registered} {...field} />
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
                    <Input disabled={isSubmitting || registered} {...field} />
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
                  <Textarea rows={3} disabled={isSubmitting || registered} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {registered ? (
            <p className="text-sm font-medium text-primary">✓ Patient registered</p>
          ) : (
            <div className="flex justify-left gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Patient"
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <div className="my-8 border-t border-border" />

      <EmergencyContactsSection patientId={patientId} />

      {registered && (
        <div className="mt-6 flex justify-left gap-4">
          <Button variant="outline" render={<Link href="/reception" />}>
            Done
          </Button>
        </div>
      )}
    </div>
  )
}
