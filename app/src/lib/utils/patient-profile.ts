interface EmergencyContactFields {
  id: string
  name: string
  relationship: string | null
  phone: string | null
}

export interface PatientProfileFields {
  nrc: string | null
  dob: string | null
  gender: string | null
  religion: string | null
  ethnicity: string | null
  address: string | null
  // emergency_contacts.patient_id references patient_profiles.user_id, not
  // users.id directly — PostgREST can only embed it here, not off `users`.
  emergency_contacts?: EmergencyContactFields[] | null
}

/**
 * Supabase embeds a to-one relation (patient_profiles.user_id is both PK and
 * FK) as an object, but our hand-written database types can't express that,
 * so callers see it typed as an array. Normalize either shape defensively.
 */
export function normalizeProfile(
  value: PatientProfileFields | PatientProfileFields[] | null | undefined
): PatientProfileFields | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}
