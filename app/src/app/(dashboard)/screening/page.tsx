import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScreeningQueueStats } from "./actions";
import { ScreeningQueueTable } from "./screening-queue-table";

export default async function ScreeningPage() {
  const stats = await getScreeningQueueStats();

  return (
    <div className="space-y-6">
      {/* Screening queue table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Patients waiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScreeningQueueTable data={stats.queue} />
        </CardContent>
      </Card>
    </div>
  );
}
