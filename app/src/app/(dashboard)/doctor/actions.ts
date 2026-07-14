"use server"

import { createClient } from "@/lib/supabase/server"

export interface DoctorDashboardStats {
  todayPatients: number
  pendingConsultations: number
  completedToday: number
  myQueue: Array<{
    id: string
    patientName: string
    status: string
    chiefComplaint: string | null
    visitDate: string
  }>
}

export async function getDoctorDashboardStats(): Promise<DoctorDashboardStats> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const defaultStats: DoctorDashboardStats = {
    todayPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
    myQueue: [],
  }

  if (!user) return defaultStats

  // Today's date range
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Fetch today's visits assigned to this doctor
  const { data: todayVisits } = await supabase
    .from("visits")
    .select("id, status, chief_complaint, patient_id, visit_date")
    .eq("doctor_id", user.id)
    .gte("visit_date", startOfDay.toISOString())
    .lt("visit_date", endOfDay.toISOString())

  // Fetch all active visits in my queue (waiting, screening, with_doctor)
  const { data: queueVisits } = await supabase
    .from("visits")
    .select("id, status, chief_complaint, patient_id, visit_date")
    .eq("doctor_id", user.id)
    .in("status", ["waiting", "screening", "with_doctor"])
    .order("created_at", { ascending: true })

  // Fetch patient names for queue
  const queuePatientIds = [
    ...new Set((queueVisits || []).map((v) => v.patient_id)),
  ]

  let patientMap: Record<string, string> = {}
  if (queuePatientIds.length > 0) {
    const { data: patients } = await supabase
      .from("users")
      .select("id, name")
      .in("id", queuePatientIds)

    if (patients) {
      patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]))
    }
  }

  const todayPatients = todayVisits?.length || 0
  const pendingConsultations =
    todayVisits?.filter((v) => v.status === "with_doctor").length || 0
  const completedToday =
    todayVisits?.filter((v) => v.status === "completed").length || 0

  const myQueue = (queueVisits || []).map((v) => ({
    id: v.id,
    patientName: patientMap[v.patient_id] || "Unknown",
    status: v.status,
    chiefComplaint: v.chief_complaint,
    visitDate: v.visit_date,
  }))

  return {
    todayPatients,
    pendingConsultations,
    completedToday,
    myQueue,
  }
}
