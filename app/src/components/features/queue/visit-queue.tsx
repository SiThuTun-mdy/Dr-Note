"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ClipboardList } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QueueRow } from "./queue-row"
import { getTodayVisits } from "@/app/(dashboard)/queue/actions"

/** Poll interval: 10 seconds as per requirements. */
const POLL_INTERVAL_MS = 10_000

export function VisitQueue() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["queue", "today"],
    queryFn: getTodayVisits,
    refetchInterval: POLL_INTERVAL_MS,
  })

  function handleTransitionComplete() {
    queryClient.invalidateQueries({ queryKey: ["queue", "today"] })
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">
          Failed to load queue. Please try refreshing the page.
        </p>
      </div>
    )
  }

  const visits = data?.data ?? []
  const userRole = data?.userRole ?? null

  // Empty state — design system §3
  if (visits.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No visits today
        </h3>
        <p className="text-sm text-muted-foreground">
          There are no visits scheduled for today. Visits will appear here as
          patients are registered.
        </p>
      </div>
    )
  }

  // Sort: waiting first, then screening, with_doctor, completed
  const statusOrder: Record<string, number> = {
    waiting: 0,
    screening: 1,
    with_doctor: 2,
    completed: 3,
  }
  const sorted = [...visits].sort(
    (a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="emr-table-header">
            <th className="text-left px-4 py-3" scope="col">
              Visit
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Patient
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Status
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Chief complaint
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Doctor
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Time
            </th>
            <th className="text-left px-4 py-3" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((visit) => (
            <QueueRow
              key={visit.id}
              visit={visit}
              userRole={userRole}
              onTransitionComplete={handleTransitionComplete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
