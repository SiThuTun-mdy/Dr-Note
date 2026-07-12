import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/features/shared/StatusBadge"

export default function DoctorPage() {
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
            <p className="text-3xl font-semibold text-foreground">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">—</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions — design system §4 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full sm:w-auto">
            View my queue
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Start consultation
          </Button>
        </CardContent>
      </Card>

      {/* My queue — design system §3: compact rows, muted header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="emr-table-header">
                  <th className="text-left px-4 py-3" scope="col">ID</th>
                  <th className="text-left px-4 py-3" scope="col">Patient</th>
                  <th className="text-left px-4 py-3" scope="col">Status</th>
                  <th className="text-left px-4 py-3" scope="col">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm text-muted-foreground">V001</td>
                  <td className="px-4 py-3 text-sm font-medium">John Doe</td>
                  <td className="px-4 py-3"><StatusBadge status="with_doctor" /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Follow-up</td>
                </tr>
                <tr className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm text-muted-foreground">V002</td>
                  <td className="px-4 py-3 text-sm font-medium">Jane Smith</td>
                  <td className="px-4 py-3"><StatusBadge status="waiting" /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Annual checkup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
