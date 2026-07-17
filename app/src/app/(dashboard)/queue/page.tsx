import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitQueue } from "@/components/features/queue/visit-queue"

export const metadata: Metadata = {
  title: "Queue",
  description: "Live view of today's patient queue",
}

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Today&apos;s queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Live view of all visits for today. Updates automatically every 10
          seconds.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Visit queue</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitQueue />
        </CardContent>
      </Card>
    </div>
  )
}
