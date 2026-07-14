"use client"

import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTodayVisitCount } from "@/components/features/patients/use-today-visit-count"

/** Reusable stat card — number of today's visits currently in "waiting" status. */
export function TodayVisitWaitingCountCard() {
  const { count, isLoading, error } = useTodayVisitCount("waiting")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Waiting queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load</p>
        ) : (
          <p className="text-3xl font-semibold text-foreground">{count}</p>
        )}
      </CardContent>
    </Card>
  )
}
