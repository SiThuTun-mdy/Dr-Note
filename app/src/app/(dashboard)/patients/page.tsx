import { PatientsDataTable, type PatientTableRow } from "@/components/features/patients/patients-data-table"
import { createClient } from "@/lib/supabase/server"

interface PatientProfileSummary {
  dob: string | null
  gender: string | null
}

function normalizePatientSummary(
  value: PatientProfileSummary | PatientProfileSummary[] | null | undefined
): PatientProfileSummary | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export default async function PatientsPage() {
  const supabase = await createClient()

  const { data: patientRole, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "patient")
    .maybeSingle()

  if (roleError) {
    console.error("[PatientsPage] failed to load patient role", roleError)
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Unable to load patients right now. Please try again.</p>
      </div>
    )
  }

  if (!patientRole) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">No patients found.</p>
      </div>
    )
  }

  const { data: patientAssignments, error: assignmentError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role_id", patientRole.id)

  if (assignmentError) {
    console.error("[PatientsPage] failed to load patient assignments", assignmentError)
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Unable to load patients right now. Please try again.</p>
      </div>
    )
  }

  const patientIds = [...new Set((patientAssignments ?? []).map((row) => row.user_id))]

  if (patientIds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">No patients found.</p>
      </div>
    )
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, patient_profiles(dob, gender)")
    .in("id", patientIds)
    .order("name", { ascending: true })

  if (error) {
    console.error("[PatientsPage] failed to fetch patients", error)
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Unable to load patients right now. Please try again.</p>
      </div>
    )
  }

  const patients: PatientTableRow[] = (data ?? []).map((patient) => {
    const profile = normalizePatientSummary(patient.patient_profiles)

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dob: profile?.dob ?? null,
      gender: profile?.gender ?? null,
    }
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Browse and open patient profiles.</p>
      </div>
      <PatientsDataTable data={patients} />
    </div>
  )
}
