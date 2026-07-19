import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service-role key for test verification (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseKey)

// ---- User helpers ----

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()
  if (error) throw error
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function getStaffProfile(userId: string) {
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()
  if (error) throw error
  return data
}

export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role_id, roles(name)")
    .eq("user_id", userId)
  if (error) throw error
  return data
}

// ---- Patient helpers ----

export async function getPatientProfile(userId: string) {
  const { data, error } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()
  if (error) throw error
  return data
}

export async function getEmergencyContacts(patientId: string) {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("patient_id", patientId)
  if (error) throw error
  return data
}

export async function deleteEmergencyContact(contactId: string) {
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", contactId)
  if (error) throw error
}

// ---- Visit helpers ----

export async function getVisitById(visitId: string) {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .single()
  if (error) throw error
  return data
}

export async function getVisitsByPatient(patientId: string) {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function createTestVisit(overrides: {
  patient_id: string
  doctor_id?: string | null
  receptionist_id: string
  visit_type: string
  status: string
  chief_complaint: string
}) {
  const id = crypto.randomUUID()
  const { data, error } = await supabase
    .from("visits")
    .insert({ id, ...overrides })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVisit(visitId: string) {
  const { error } = await supabase.from("visits").delete().eq("id", visitId)
  if (error) throw error
}

// ---- Screening helpers ----

export async function getScreeningByVisitId(visitId: string) {
  const { data, error } = await supabase
    .from("screenings")
    .select("*")
    .eq("visit_id", visitId)
    .single()
  if (error) throw error
  return data
}

// ---- Diagnosis helpers ----

export async function getVisitDiagnoses(visitId: string) {
  const { data, error } = await supabase
    .from("visit_diagnoses")
    .select("*, diagnoses(code, title)")
    .eq("visit_id", visitId)
  if (error) throw error
  return data
}

export async function deleteVisitDiagnosis(id: string) {
  const { error } = await supabase
    .from("visit_diagnoses")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ---- Prescription helpers ----

export async function getPrescriptionsByVisitId(visitId: string) {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*, prescription_items(*)")
    .eq("visit_id", visitId)
  if (error) throw error
  return data
}

// ---- Cleanup helpers ----

export async function cleanupTestUser(email: string) {
  // Get user first
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (!user) return

  // Delete user_roles
  await supabase.from("user_roles").delete().eq("user_id", user.id)
  // Delete staff_profiles
  await supabase.from("staff_profiles").delete().eq("user_id", user.id)
  // Delete patient_profiles
  await supabase.from("patient_profiles").delete().eq("user_id", user.id)
  // Delete public.users
  await supabase.from("users").delete().eq("id", user.id)
  // Delete auth.users (requires admin)
  await supabase.auth.admin.deleteUser(user.id)
}
