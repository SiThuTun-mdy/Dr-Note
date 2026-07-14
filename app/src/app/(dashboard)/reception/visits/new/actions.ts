"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  visitCreationSchema,
  type VisitCreationInput,
} from "@/lib/validators/visit"

const ALLOWED_ROLES = new Set(["admin", "receptionist"])

interface CreateVisitResult {
  success: boolean
  visitId?: string
  error?: string
  fieldErrors?: Partial<Record<keyof VisitCreationInput, string>>
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

export async function createVisit(
  values: VisitCreationInput
): Promise<CreateVisitResult> {
  const validated = visitCreationSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: "Please fix the highlighted fields." }
  }

  const { patientId, visitType, chiefComplaint, doctorId } = validated.data

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const role = await getCurrentRole(supabase, user.id)
  if (!role || !ALLOWED_ROLES.has(role)) {
    return { success: false, error: "Unauthorized" }
  }

  // Verify patient exists
  const { data: patient, error: patientError } = await supabase
    .from("users")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { patientId: "Patient not found" },
    }
  }

  // Verify doctor exists if provided
  if (doctorId) {
    const { data: doctor, error: doctorError } = await supabase
      .from("users")
      .select("id")
      .eq("id", doctorId)
      .single()

    if (doctorError || !doctor) {
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { doctorId: "Doctor not found" },
      }
    }
  }

  // Create the visit
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId || null,
      receptionist_id: user.id,
      visit_type: visitType,
      chief_complaint: chiefComplaint,
      status: "waiting",
      visit_date: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (visitError) {
    console.error("[CreateVisit] Visit insert failed", visitError)
    return { success: false, error: "Unable to create visit. Please try again." }
  }

  revalidatePath("/reception")
  revalidatePath("/my-queue")
  redirect(`/my-queue`)
}

export async function searchPatients(query: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const roleName =
    (roles?.[0] as unknown as { roles: { name: string } | null } | undefined)
      ?.roles?.name ?? null

  if (!roleName || !ALLOWED_ROLES.has(roleName)) return []

  // Escape LIKE wildcards to prevent pattern manipulation
  const safeQuery = query.replace(/[%_\\]/g, "\\$&")

  // Search patients by name or NRC
  const { data: patients } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      patient_profiles(nrc)
    `)
    .or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`)
    .limit(10)

  // Also search by NRC
  const { data: nrcPatients } = await supabase
    .from("patient_profiles")
    .select(`
      user_id,
      nrc,
      users(id, name, email)
    `)
    .ilike("nrc", `%${safeQuery}%`)
    .limit(10)

  // Merge and deduplicate
  const patientMap = new Map<string, { id: string; name: string; email: string; nrc: string | null }>()

  for (const p of patients || []) {
    const profile = p.patient_profiles as unknown as { nrc: string | null } | null
    patientMap.set(p.id, {
      id: p.id,
      name: p.name,
      email: p.email,
      nrc: profile?.nrc ?? null,
    })
  }

  for (const p of nrcPatients || []) {
    const userData = p.users as unknown as { id: string; name: string; email: string } | null
    if (userData && !patientMap.has(userData.id)) {
      patientMap.set(userData.id, {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        nrc: p.nrc,
      })
    }
  }

  return Array.from(patientMap.values()).slice(0, 10)
}

export async function searchDoctors(query: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Check authorization
  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const roleName =
    (roles?.[0] as unknown as { roles: { name: string } | null } | undefined)
      ?.roles?.name ?? null

  if (!roleName || !ALLOWED_ROLES.has(roleName)) return []

  // Escape LIKE wildcards to prevent pattern manipulation
  const safeQuery = query.replace(/[%_\\]/g, "\\$&")

  // Search doctors by name or email
  const { data: doctors } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      user_roles!inner(roles(name))
    `)
    .or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`)
    .limit(10)

  // Filter to only doctors
  return (doctors || [])
    .filter((d) => {
      const roles = d.user_roles as unknown as { roles: { name: string } }[]
      return roles?.some((r) => r.roles?.name === "doctor")
    })
    .map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
    }))
}
