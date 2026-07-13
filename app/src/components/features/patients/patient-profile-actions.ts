"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserRoles } from "@/lib/auth/roles"
import {
  patientProfileUpdateSchema,
  type PatientProfileUpdateInput,
} from "@/lib/validators/patient"
import { normalizeProfile } from "@/lib/utils/patient-profile"
import type { EmergencyContact } from "./emergency-contacts-actions"

// 01-database-schema.md §6: patients.update → admin + receptionist only.
const UPDATE_ROLES = new Set(["admin", "receptionist"])

export interface PatientProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  nrc: string | null
  dob: string | null
  gender: string | null
  religion: string | null
  ethnicity: string | null
  address: string | null
  emergencyContacts: EmergencyContact[]
}

interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Partial<Record<keyof PatientProfileUpdateInput, string>>
}

export async function updatePatientProfile(
  patientId: string,
  values: PatientProfileUpdateInput
): Promise<ActionResult<PatientProfileData>> {
  const validated = patientProfileUpdateSchema.safeParse(values)
  if (!validated.success) {
    const fieldErrors: Partial<Record<keyof PatientProfileUpdateInput, string>> = {}
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as keyof PatientProfileUpdateInput
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const roles = await getUserRoles(supabase, user.id)
  if (!roles.some((role) => UPDATE_ROLES.has(role))) {
    return { success: false, error: "Unauthorized" }
  }

  const { name, phone, dob, gender, nrc, religion, ethnicity, address } = validated.data

  const { data: updatedUser, error: userError } = await supabase
    .from("users")
    .update({ name, phone: phone || null })
    .eq("id", patientId)
    .select("id")
    .maybeSingle()

  if (userError || !updatedUser) {
    console.error("[PatientProfile] users update failed", userError)
    return { success: false, error: "Unable to update patient. Please try again." }
  }

  const { data: updatedProfile, error: profileError } = await supabase
    .from("patient_profiles")
    .update({
      dob: dob || null,
      gender: gender || null,
      nrc: nrc || null,
      religion: religion || null,
      ethnicity: ethnicity || null,
      address: address || null,
    })
    .eq("user_id", patientId)
    .select("user_id")
    .maybeSingle()

  if (profileError || !updatedProfile) {
    console.error("[PatientProfile] patient_profiles update failed", profileError)
    return { success: false, error: "Unable to update patient. Please try again." }
  }

  // emergency_contacts.patient_id references patient_profiles.user_id, not
  // users.id, so it can only be embedded via patient_profiles — PostgREST
  // requires a direct FK for an embed.
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, patient_profiles(nrc, dob, gender, religion, ethnicity, address, emergency_contacts(id, name, relationship, phone))"
    )
    .eq("id", patientId)
    .maybeSingle()

  if (error || !data) {
    console.error("[PatientProfile] refetch after update failed", error)
    return { success: false, error: "Saved, but could not refresh the page. Please reload." }
  }

  const profile = normalizeProfile(data.patient_profiles)

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      nrc: profile?.nrc ?? null,
      dob: profile?.dob ?? null,
      gender: profile?.gender ?? null,
      religion: profile?.religion ?? null,
      ethnicity: profile?.ethnicity ?? null,
      address: profile?.address ?? null,
      emergencyContacts: (profile?.emergency_contacts ?? []) as EmergencyContact[],
    },
  }
}
