import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNurseDashboardStats } from "./actions"
import { NurseQueueTable } from "./nurse-queue-table"

export default async function NursePage() {
  const stats = await getNurseDashboardStats()

  return (
    <div className="space-y-6">
      {/* Stats cards — design system §4: nurse → waiting-for-screening list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting screening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.awaitingScreening}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.inProgress}
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

      {/* Screening queue — design system §3: compact rows, muted header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Screening queue</CardTitle>
        </CardHeader>
        <CardContent>
          <NurseQueueTable data={stats.screeningQueue} />
        </CardContent>
      </Card>
    </div>
  )
}
