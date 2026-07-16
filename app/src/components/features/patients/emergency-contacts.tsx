"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  addEmergencyContact,
  removeEmergencyContact,
  type EmergencyContact,
} from "./emergency-contacts-actions"
import { emergencyContactSchema, type EmergencyContactInput } from "@/lib/validators/patient"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EmergencyContactsSectionProps {
  /** The patient these contacts belong to. Null until the patient exists —
   * fields stay enabled, but submitting shows an error until then. */
  patientId: string | null
  /** Contacts already on record, e.g. when showing an existing patient's profile. */
  initialContacts?: EmergencyContact[]
  /** Hide the add form and remove buttons for viewers without `patients.update`. */
  readOnly?: boolean
}

const emptyValues: EmergencyContactInput = { name: "", relationship: "", phone: "" }

export function EmergencyContactsSection({
  patientId,
  initialContacts = [],
  readOnly = false,
}: EmergencyContactsSectionProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [lastAttempt, setLastAttempt] = useState<EmergencyContactInput | null>(null)
  const [removeTarget, setRemoveTarget] = useState<EmergencyContact | null>(null)
  const [removeError, setRemoveError] = useState<{ contact: EmergencyContact; message: string } | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const form = useForm<EmergencyContactInput>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: emptyValues,
  })

  async function submitContact(values: EmergencyContactInput) {
    if (!patientId) {
      toast.error("Register the patient above before adding emergency contacts.")
      return
    }
    setIsSubmitting(true)
    setAddError(null)
    try {
      const result = await addEmergencyContact(patientId, values)
      if (!result.success || !result.data) {
        setLastAttempt(values)
        setAddError(result.error || "Unable to add contact. Please try again.")
        toast.error(result.error || "Unable to add contact. Please try again.")
        return
      }
      setContacts((prev) => [...prev, result.data as EmergencyContact])
      setLastAttempt(null)
      form.reset(emptyValues)
      toast.success("Emergency contact added")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRetryAdd() {
    if (!lastAttempt) return
    await submitContact(lastAttempt)
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return
    const target = removeTarget
    setRemoveTarget(null)
    setIsRemoving(true)
    setRemoveError(null)
    try {
      const result = await removeEmergencyContact(target.id)
      if (!result.success) {
        setRemoveError({ contact: target, message: result.error || "Unable to remove contact. Please try again." })
        toast.error(result.error || "Unable to remove contact. Please try again.")
        return
      }
      setContacts((prev) => prev.filter((c) => c.id !== target.id))
      toast.success("Emergency contact removed")
    } finally {
      setIsRemoving(false)
    }
  }

  async function handleRetryRemove() {
    if (!removeError) return
    const target = removeError.contact
    setRemoveError(null)
    setIsRemoving(true)
    try {
      const result = await removeEmergencyContact(target.id)
      if (!result.success) {
        setRemoveError({ contact: target, message: result.error || "Unable to remove contact. Please try again." })
        toast.error(result.error || "Unable to remove contact. Please try again.")
        return
      }
      setContacts((prev) => prev.filter((c) => c.id !== target.id))
      toast.success("Emergency contact removed")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Emergency contacts</h3>
      </div>

      {contacts.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[contact.relationship, contact.phone].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${contact.name}`}
                  disabled={isRemoving}
                  onClick={() => setRemoveTarget(contact)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        readOnly && <p className="text-sm text-muted-foreground">No emergency contacts on record.</p>
      )}

      {!readOnly && removeError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center justify-between gap-4">
          <span>
            Something went wrong removing {removeError.contact.name} — retry?
          </span>
          <Button type="button" size="sm" onClick={handleRetryRemove} disabled={isRemoving}>
            {isRemoving ? <Loader2 className="animate-spin" /> : "Retry"}
          </Button>
        </div>
      )}

      {!readOnly && (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitContact)} className="space-y-4">
          {addError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center justify-between gap-4">
              <span>Something went wrong — retry?</span>
              <Button type="button" size="sm" onClick={handleRetryAdd} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Retry"}
              </Button>
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name *</FormLabel>
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
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship (optional)</FormLabel>
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
          </div>

          <div className="flex justify-left gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Adding...
              </>
            ) : (
              "Add contact"
            )}
          </Button>
          </div>
        </form>
      </Form>
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove emergency contact?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget ? `${removeTarget.name} will be removed from this patient's emergency contacts.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
