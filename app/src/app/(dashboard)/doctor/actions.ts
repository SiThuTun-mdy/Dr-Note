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

  // Single query: fetch all visits assigned to this doctor
  const { data: allVisits } = await supabase
    .from("visits")
    .select("id, status, chief_complaint, patient_id, visit_date, created_at")
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: true })

  if (!allVisits || allVisits.length === 0) {
    return defaultStats
  }

  // Filter in JS for today stats
  const todayVisits = allVisits.filter((v) => {
    const visitDate = new Date(v.visit_date)
    return visitDate >= startOfDay && visitDate < endOfDay
  })

  // Filter in JS for queue (active statuses, any date)
  const queueVisits = allVisits.filter((v) =>
    ["waiting", "screening", "with_doctor"].includes(v.status)
  )

  // Fetch patient names for queue
  const queuePatientIds = [
    ...new Set(queueVisits.map((v) => v.patient_id)),
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

  const todayPatients = todayVisits.length
  const pendingConsultations =
    todayVisits.filter((v) => v.status === "with_doctor").length
  const completedToday =
    todayVisits.filter((v) => v.status === "completed").length

  const myQueue = queueVisits.map((v) => ({
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
