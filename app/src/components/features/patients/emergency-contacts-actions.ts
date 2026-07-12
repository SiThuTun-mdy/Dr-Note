"use server"

import { createClient } from "@/lib/supabase/server"
import { emergencyContactSchema, type EmergencyContactInput } from "@/lib/validators/patient"

// Same roles as patient registration (01-database-schema.md §6: insert needs
// `patients.create`, delete needs `patients.update` — admin + receptionist
// hold both).
const ALLOWED_ROLES = new Set(["admin", "receptionist"])

export interface EmergencyContact {
  id: string
  name: string
  relationship: string | null
  phone: string | null
}

interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

async function getCurrentRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)
    .limit(1)

  return (
    (data?.[0] as unknown as { roles: { name: string } | null } | undefined)
      ?.roles?.name ?? null
  )
}

export async function addEmergencyContact(
  patientId: string,
  values: EmergencyContactInput
): Promise<ActionResult<EmergencyContact>> {
  const validated = emergencyContactSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const role = await getCurrentRole(supabase, user.id)
  if (!role || !ALLOWED_ROLES.has(role)) {
    return { success: false, error: "Unauthorized" }
  }

  const { relationship, phone } = validated.data
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert({
      patient_id: patientId,
      name: validated.data.name,
      relationship: relationship || null,
      phone: phone || null,
    })
    .select("id, name, relationship, phone")
    .single()

  if (error || !data) {
    console.error("[EmergencyContacts] insert failed", error)
    return { success: false, error: "Unable to add contact. Please try again." }
  }

  return { success: true, data }
}

export async function removeEmergencyContact(contactId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const role = await getCurrentRole(supabase, user.id)
  if (!role || !ALLOWED_ROLES.has(role)) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("emergency_contacts").delete().eq("id", contactId)

  if (error) {
    console.error("[EmergencyContacts] delete failed", error)
    return { success: false, error: "Unable to remove contact. Please try again." }
  }

  return { success: true }
}
