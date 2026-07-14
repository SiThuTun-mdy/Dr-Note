import { useQuery } from "@tanstack/react-query"

import { getTodayVisits } from "@/app/(dashboard)/queue/actions"
import type { VisitStatus } from "@/app/(dashboard)/queue/actions"

/** Poll interval: keep in sync with the main queue view. */
// const POLL_INTERVAL_MS = 10_000

/**
 * Shared query for today's visit count, optionally narrowed to a single
 * status. Used by TodayVisitCountCard and TodayVisitWaitingCountCard.
 */
export function useTodayVisitCount(status?: VisitStatus) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["queue", "today", status ?? "all"],
    queryFn: () => getTodayVisits(status),
    // refetchInterval: POLL_INTERVAL_MS,
  })

  return {
    count: data?.data?.length ?? 0,
    isLoading,
    error,
  }
}
