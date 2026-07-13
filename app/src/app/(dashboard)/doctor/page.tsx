import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDoctorDashboardStats } from "./actions"
import { DoctorQueueTable } from "./doctor-queue-table"

export default async function DoctorPage() {
  const stats = await getDoctorDashboardStats()

  return (
    <div className="space-y-6">
      {/* Stats cards — design system §4: doctor → my queue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.todayPatients}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.pendingConsultations}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.completedToday}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My queue — design system §3: compact rows, muted header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My queue</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorQueueTable data={stats.myQueue} />
        </CardContent>
      </Card>
    </div>
  )
}
