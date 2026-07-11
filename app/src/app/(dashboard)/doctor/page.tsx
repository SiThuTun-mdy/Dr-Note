import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DoctorPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Doctor Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Today&apos;s Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">Clinical features coming soon:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>View patient queue</li>
            <li>Consultation notes</li>
            <li>Diagnosis entry</li>
            <li>Prescription writing</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
