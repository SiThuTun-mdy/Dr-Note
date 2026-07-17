import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Patient Profile",
  description: "View patient details and visit history",
}
import { getUserRoles } from "@/lib/auth/roles"
import { PatientProfileView } from "@/components/features/patients/patient-profile-view"
import { VisitHistorySection } from "@/components/features/patients/visit-history-section"
import type { PatientVisitRow } from "@/components/features/patients/patient-visits-data-table"
import type { PatientProfileData } from "@/components/features/patients/patient-profile-actions"
import type { EmergencyContact } from "@/components/features/patients/emergency-contacts-actions"
import { normalizeProfile } from "@/lib/utils/patient-profile"
import { Button } from "@/components/ui/button"

// 01-database-schema.md §6: patients.read → admin/doctor/nurse/receptionist
// (+ the patient themselves, own record only). patients.update → admin/receptionist.
const READ_ROLES = new Set(["doctor", "nurse", "receptionist"])
const UPDATE_ROLES = new Set(["receptionist"])
const CREATE_VISIT_ROLES = new Set(["receptionist"])

type Props = {
  params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2">You do not have permission to view this patient.</p>
      </div>
    )
  }

  const isOwner = user.id === id
  const roles = isOwner ? [] : await getUserRoles(supabase, user.id)
  const canRead = isOwner || roles.some((role) => READ_ROLES.has(role))

  if (!canRead) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2">You do not have permission to view this patient.</p>
      </div>
    )
  }

  // emergency_contacts.patient_id references patient_profiles.user_id, not
  // users.id, so it can only be embedded via patient_profiles — PostgREST
  // requires a direct FK for an embed.
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, patient_profiles(nrc, dob, gender, religion, ethnicity, address, emergency_contacts(id, name, relationship, phone))"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[PatientProfile] fetch failed", error)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load this patient right now. Please try again.
        </p>
      </div>
    )
  }

  if (!data) {
    notFound()
  }

  const profile = normalizeProfile(data.patient_profiles)

  const profileData: PatientProfileData = {
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
  }

  const canEdit = !isOwner && roles.some((role) => UPDATE_ROLES.has(role))
  const canCreateVisit = !isOwner && roles.some((role) => CREATE_VISIT_ROLES.has(role))
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("id, visit_date, status, visit_type, chief_complaint")
    .eq("patient_id", id)
    .order("visit_date", { ascending: false })

  if (visitsError) {
    console.error("[PatientProfile] visits fetch failed", visitsError)
  }

  const visitRows: PatientVisitRow[] = (visits ?? []).map((visit) => ({
    id: visit.id,
    patientId: id,
    visitDate: visit.visit_date,
    status: visit.status,
    visitType: visit.visit_type,
    chiefComplaint: visit.chief_complaint,
  }))

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profileData.name}</h1>
          <p className="text-sm text-muted-foreground">Patient ID: {id}</p>
        </div>
        {canCreateVisit && (
          <Button render={<Link href={`/reception/visits/new?patientId=${id}`} />} nativeButton={false}>
            New Visit
          </Button>
        )}
      </div>
      <PatientProfileView patientId={id} initialData={profileData} canEdit={canEdit} />
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Visit history</h2>
          <p className="text-sm text-muted-foreground">
            View and manage visits for this patient.
          </p>
        </div>
        <VisitHistorySection
          visits={visitRows}
          userRole={roles[0] ?? null}
          hasError={!!visitsError}
        />
      </section>
    </div>
  )
}
