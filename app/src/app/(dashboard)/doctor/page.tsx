import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import { getDoctorDashboardStats } from "./actions"

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
          {stats.myQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patients in queue
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="emr-table-header">
                    <th className="text-left px-4 py-3" scope="col">
                      Patient
                    </th>
                    <th className="text-left px-4 py-3" scope="col">
                      Status
                    </th>
                    <th className="text-left px-4 py-3" scope="col">
                      Reason
                    </th>
                    <th className="text-left px-4 py-3" scope="col">
                      Visit Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.myQueue.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctor/visits/${visit.id}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {visit.patientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={
                            visit.status as
                              | "waiting"
                              | "screening"
                              | "with_doctor"
                              | "completed"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {visit.chiefComplaint || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
