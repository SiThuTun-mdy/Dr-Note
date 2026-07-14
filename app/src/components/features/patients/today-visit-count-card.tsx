"use client"

import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTodayVisitCount } from "@/components/features/patients/use-today-visit-count"
import { Users } from "lucide-react"


/** Reusable stat card — total number of visits created today. */
export function TodayVisitCountCard() {
  const { count, isLoading, error } = useTodayVisitCount()

  return (
    <Card className="p-6">
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today&apos;s visits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load</p>
        ) : (
          <p className="text-3xl font-semibold text-foreground">{count}</p>
        )}
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
        </div>
        </div>
      </CardContent>
      
    </Card>
  )
}
