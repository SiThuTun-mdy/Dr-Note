"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ClipboardList, RefreshCw } from "lucide-react"

import { getTodayVisits } from "@/app/(dashboard)/queue/actions"
import type { VisitStatus } from "@/app/(dashboard)/queue/actions"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"

/** Poll interval: keep in sync with the main queue view (10 seconds). */
const POLL_INTERVAL_MS = 10_000

const STATUS_OPTIONS: { value: VisitStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "waiting", label: "Waiting" },
  { value: "screening", label: "Screening" },
  { value: "with_doctor", label: "With Doctor" },
  { value: "completed", label: "Completed" },
]

const COLUMNS = ["Patient", "Status", "Visit type", "Time"]

function formatVisitTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

/** Reusable "today's visits" table — patient name, status, search, filter, pagination. */
export function SameDayVisitDataTable() {
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["queue", "today"],
    queryFn: () => getTodayVisits(),
    refetchInterval: POLL_INTERVAL_MS,
  })

  const visits = useMemo(() => data?.data ?? [], [data])

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? visits
        : visits.filter((v) => v.status === statusFilter),
    [visits, statusFilter]
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive mb-4">
          Failed to load today&apos;s visits. Please try again.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No visits today
        </h3>
        <p className="text-sm text-muted-foreground">
          Registered patients will appear here once a visit is created.
        </p>
      </div>
    )
  }

  const filterSlot = (
    <Select
      value={statusFilter}
      onValueChange={(v) => setStatusFilter((v as VisitStatus | "all") ?? "all")}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <DataTable
      data={filtered}
      searchKeys={["patient_name", "chief_complaint", "doctor_name"]}
      searchPlaceholder="Search by patient..."
      pageSize={10}
      filters={filterSlot}
      columns={COLUMNS}
      emptyMessage="No visits match your search."
      renderRow={(visit) => (
        <TableRow key={visit.id}>
          <TableCell className="font-medium">{visit.patient_name}</TableCell>
          <TableCell>
            <StatusBadge status={visit.status} />
          </TableCell>
          <TableCell className="text-muted-foreground capitalize">
            {visit.visit_type ?? "—"}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {formatVisitTime(visit.visit_date)}
          </TableCell>
        </TableRow>
      )}
    />
  )
}
