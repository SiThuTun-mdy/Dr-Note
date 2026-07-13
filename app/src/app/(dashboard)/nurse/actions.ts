"use server"

import { createClient } from "@/lib/supabase/server"

export interface NurseDashboardStats {
  awaitingScreening: number
  inProgress: number
  completedToday: number
  screeningQueue: Array<{
    id: string
    patientName: string
    status: string
    visitType: string | null
    chiefComplaint: string | null
    visitDate: string
    createdAt: string
  }>
}

export async function getNurseDashboardStats(): Promise<NurseDashboardStats> {
  const supabase = await createClient()

  const defaultStats: NurseDashboardStats = {
    awaitingScreening: 0,
    inProgress: 0,
    completedToday: 0,
    screeningQueue: [],
  }

  // Today's date range
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Fetch visits waiting for screening (waiting status)
  const { data: waitingVisits } = await supabase
    .from("visits")
    .select("id, status, visit_type, chief_complaint, patient_id, visit_date, created_at")
    .in("status", ["waiting"])
    .order("created_at", { ascending: true })

  // Fetch visits currently in screening (screening status)
  const { data: screeningVisits } = await supabase
    .from("visits")
    .select("id")
    .eq("status", "screening")

  // Fetch completed today
  const { data: completedVisits } = await supabase
    .from("visits")
    .select("id")
    .eq("status", "completed")
    .gte("visit_date", startOfDay.toISOString())
    .lt("visit_date", endOfDay.toISOString())

  // Fetch patient names for waiting visits
  const patientIds = [...new Set((waitingVisits || []).map(v => v.patient_id))]
  let patientMap: Record<string, string> = {}
  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from("users")
      .select("id, name")
      .in("id", patientIds)
    if (patients) {
      patientMap = Object.fromEntries(patients.map(p => [p.id, p.name]))
    }
  }

  const screeningQueue = (waitingVisits || []).map(v => ({
    id: v.id,
    patientName: patientMap[v.patient_id] || "Unknown",
    status: v.status,
    visitType: v.visit_type,
    chiefComplaint: v.chief_complaint,
    visitDate: v.visit_date,
    createdAt: v.created_at,
  }))

  return {
    awaitingScreening: waitingVisits?.length || 0,
    inProgress: screeningVisits?.length || 0,
    completedToday: completedVisits?.length || 0,
    screeningQueue,
  }
}
