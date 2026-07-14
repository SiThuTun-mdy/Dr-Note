"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { getPatientRegistrationCount } from "@/app/(dashboard)/reception/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Poll interval: keep in sync with the other reception stat cards. */
const POLL_INTERVAL_MS = 10_000

/** Reusable stat card — number of patients registered today. */
export function TodayPatientRegistrationCountCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-registrations", "today"],
    queryFn: () => getPatientRegistrationCount(),
    refetchInterval: POLL_INTERVAL_MS,
  })

  const count = data?.count ?? 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          New registrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : error || data?.error ? (
          <p className="text-sm text-destructive">Failed to load</p>
        ) : (
          <p className="text-3xl font-semibold text-foreground">{count}</p>
        )}
      </CardContent>
    </Card>
  )
}
