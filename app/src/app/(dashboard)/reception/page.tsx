import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SameDayVisitDataTable } from "@/components/features/patients/same-day-visit-data-table"
import { TodayVisitCountCard } from "@/components/features/patients/today-visit-count-card"
import { TodayVisitWaitingCountCard } from "@/components/features/patients/today-visit-waiting-count-card"
import { TodayPatientRegistrationCountCard } from "@/components/features/patients/today-patient-registration-count-card"

export default function ReceptionPage() {
  return (
    <div className="space-y-6">
      {/* Stats cards — design system §4: reception → today's queue + "Register patient" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TodayVisitCountCard />
        <TodayVisitWaitingCountCard />
        <TodayPatientRegistrationCountCard />
      </div>

      {/* Quick actions — design system §4 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/reception/patients/new" />}
          >
            Patient Registration
          </Button>
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/queue" />}
          >
            View queue
          </Button>
        </CardContent>
      </Card>

      {/* Today's visits — design system §3: compact rows, muted header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <SameDayVisitDataTable />
        </CardContent>
      </Card>
    </div>
  )
}
