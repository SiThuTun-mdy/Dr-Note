import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { MyQueueTable } from "../my-queue/my-queue-table"

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  description: "Today's patients and consultation queue",
}
import type { QueueVisitData } from "../my-queue/page"

interface PageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function DoctorPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Parse date from query param, default to today
  const params = await searchParams
  const dateStr = params?.date
  const targetDate = new Date()
  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number)
    targetDate.setFullYear(year, month - 1, day)
  }
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Stats queries
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const { data: allVisits } = await supabase
    .from("visits")
    .select("id, status, chief_complaint, patient_id, visit_date, visit_type, created_at")
    .eq("doctor_id", user?.id || "")
    .order("created_at", { ascending: true })

  const todayVisits = (allVisits || []).filter((v) => {
    const d = new Date(v.visit_date)
    return d >= todayStart && d < todayEnd
  })

  const todayPatients = todayVisits.length
  const pendingConsultations = todayVisits.filter((v) => v.status === "with_doctor").length
  const completedToday = todayVisits.filter((v) => v.status === "completed").length

  // Queue for selected date (exclude waiting)
  const dateVisits = (allVisits || []).filter((v) => {
    const d = new Date(v.visit_date)
    return d >= startOfDay && d < endOfDay && v.status !== "waiting"
  })

  const queuePatientIds = [...new Set(dateVisits.map((v) => v.patient_id))]
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

  const enrichedQueue: QueueVisitData[] = dateVisits.map((v) => ({
    id: v.id,
    patient_id: v.patient_id,
    visit_type: v.visit_type,
    status: v.status as QueueVisitData["status"],
    chief_complaint: v.chief_complaint,
    visit_date: v.visit_date,
    patientName: patientMap[v.patient_id] || "Unknown",
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{todayPatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{pendingConsultations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{completedToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* My queue with date navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My queue</CardTitle>
        </CardHeader>
        <CardContent>
          <MyQueueTable data={enrichedQueue} selectedDate={startOfDay} basePath="/doctor" />
        </CardContent>
      </Card>
    </div>
  )
}
