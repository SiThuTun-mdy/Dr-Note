"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { onboardStaff } from "./actions"
import {
  staffOnboardingSchema,
  staffRoleOptions,
  type StaffOnboardingInput,
} from "@/lib/validators/staff"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

function getRoleLabel(role: (typeof staffRoleOptions)[number]) {
  switch (role) {
    case "doctor":
      return "Doctor"
    case "nurse":
      return "Nurse"
    case "receptionist":
      return "Registrar"
    case "admin":
      return "Admin"
  }
}

const departmentOptions = [
  "General Medicine",
  "Emergency",
  "Pediatrics",
  "Cardiology",
  "Radiology",
  "Laboratory",
  "Administration",
] as const

const neutralFocusRingClass =
  "focus-visible:border-primary focus-visible:ring-primary/40 aria-invalid:border-primary aria-invalid:ring-primary/40"

const defaultValues = {
  name: "",
  email: "",
  phone: "",
  staff_code: "",
  department: "",
  role: undefined,
}

export function StaffOnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<{
    name: string
    email: string
    tempPassword: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<StaffOnboardingInput>({
    resolver: zodResolver(staffOnboardingSchema),
    defaultValues,
  })

  async function onSubmit(values: StaffOnboardingInput) {
    setIsSubmitting(true)
    try {
      const result = await onboardStaff(values)

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof StaffOnboardingInput, { message })
          }
        }
        toast.error(
          result.error || "Unable to create staff account. Please try again."
        )
        return
      }

      if (!result.tempPassword) {
        // The account exists but the shown-once password is missing — never
        // render the success card with an empty password block.
        toast.error(
          "Account created, but no password was returned. Ask the staff member to use the email link to set one."
        )
        return
      }

      toast.success("Staff account created")
      setCreated({
        name: values.name,
        email: values.email,
        tempPassword: result.tempPassword,
      })
    } catch (err) {
      if (isRedirectError(err)) throw err
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyPassword() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Unable to copy — please select and copy manually.")
    }
  }

  function addAnother() {
    setCreated(null)
    setCopied(false)
    form.reset(defaultValues)
  }

  if (created) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Check className="size-4 text-primary" aria-hidden="true" />
              Account created for {created.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Temporary password — shown only once. Share it with{" "}
                {created.email} securely.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                  {created.tempPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                  aria-label="Copy temporary password"
                >
                  {copied ? <Check className="text-primary" /> : <Copy />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email was sent to {created.email}. This password
              will not work until the staff member opens that link — logging
              in first shows &ldquo;email not confirmed&rdquo;. If they choose
              to set their own password on that page, this temporary one is
              replaced.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" onClick={addAnother}>
            Add another staff member
          </Button>
          <Button variant="outline" render={<Link href="/admin/users" />}>
            Back to user management
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-slate-200 bg-slate-50/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Clinical staff registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-lg space-y-5"
            autoComplete="off"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full legal name *</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      autoComplete="off"
                      className={neutralFocusRingClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage aria-live="polite" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staff_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National Provider Identifier / License Number *</FormLabel>
                  <FormDescription>
                    Enter exactly 10 digits.
                  </FormDescription>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={10}
                      disabled={isSubmitting}
                      autoComplete="off"
                      className={neutralFocusRingClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage aria-live="polite" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical department assignment *</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className={`w-full ${neutralFocusRingClass}`}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentOptions.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage aria-live="polite" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Access role *</FormLabel>
                  <div
                    role="radiogroup"
                    aria-label="Access role"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "role-error" : undefined}
                    className="space-y-2"
                  >
                    {staffRoleOptions.map((role) => (
                      <label
                        key={role}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={role}
                          checked={field.value === role}
                          onChange={() => field.onChange(role)}
                          onBlur={field.onBlur}
                          disabled={isSubmitting}
                          className="size-4 border-slate-400 accent-primary focus-visible:ring-primary/40"
                        />
                        <span>{getRoleLabel(role)}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage id="role-error" aria-live="polite" />
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
                      disabled={isSubmitting}
                      autoComplete="off"
                      className={neutralFocusRingClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage aria-live="polite" />
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
                      disabled={isSubmitting}
                      autoComplete="off"
                      className={neutralFocusRingClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage aria-live="polite" />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Create staff account"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
