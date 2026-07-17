import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScreeningQueueStats } from "./actions";
import { ScreeningQueueTable } from "./screening-queue-table";

export const metadata: Metadata = {
  title: "Screening",
  description: "Patients waiting for screening",
};

export default async function ScreeningPage() {
  const stats = await getScreeningQueueStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Screening</h1>
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
