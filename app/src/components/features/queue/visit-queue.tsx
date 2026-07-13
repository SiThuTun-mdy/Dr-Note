"use client"

import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ClipboardList, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QueueRow } from "./queue-row"
import { getTodayVisits } from "@/app/(dashboard)/queue/actions"
import type { VisitStatus } from "@/components/features/shared/StatusBadge"

/** Poll interval: 10 seconds as per requirements. */
const POLL_INTERVAL_MS = 10_000

const STATUS_OPTIONS: { value: VisitStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "waiting", label: "Waiting" },
  { value: "screening", label: "Screening" },
  { value: "with_doctor", label: "With Doctor" },
  { value: "completed", label: "Completed" },
]

export function VisitQueue() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all")
  const [doctorFilter, setDoctorFilter] = useState<string>("all")

  const { data, isLoading, error, refetch } = useQuery({
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
        <p className="text-sm text-destructive mb-4">
          Failed to load queue. Please try again.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const visits = data?.data ?? []
  const userRole = data?.userRole ?? null

  // Empty state — design system §6
  if (visits.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No visits today
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Register a patient to get started.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/reception/patients/new"}>
          Register Patient
        </Button>
      </div>
    )
  }

  // Get unique doctors for filter
  const doctors = useMemo(() => {
    const doctorMap = new Map<string, string>()
    for (const visit of visits) {
      if (visit.doctor_id && visit.doctor_name) {
        doctorMap.set(visit.doctor_id, visit.doctor_name)
      }
    }
    return Array.from(doctorMap.entries()).map(([id, name]) => ({ id, name }))
  }, [visits])

  // Sort: waiting first, then screening, with_doctor, completed
  const statusOrder: Record<string, number> = {
    waiting: 0,
    screening: 1,
    with_doctor: 2,
    completed: 3,
  }

  // Apply filters
  const filtered = useMemo(() => {
    return [...visits]
      .filter(
        (v) =>
          (statusFilter === "all" || v.status === statusFilter) &&
          (doctorFilter === "all" || v.doctor_id === doctorFilter)
      )
      .sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0))
  }, [visits, statusFilter, doctorFilter])

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as VisitStatus | "all")}
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

        {doctors.length > 0 && (
          <Select value={doctorFilter} onValueChange={(v) => setDoctorFilter(v ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
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
            {filtered.map((visit) => (
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
    </div>
  )
}
