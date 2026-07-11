import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReceptionPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Reception Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Today&apos;s Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Waiting Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              New Registrations
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
          <p className="text-sm text-gray-500">Reception features coming soon:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Patient registration</li>
            <li>Visit creation</li>
            <li>Queue management</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
