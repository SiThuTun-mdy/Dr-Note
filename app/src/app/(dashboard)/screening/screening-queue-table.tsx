"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"

interface QueueVisit {
  id: string
  patientName: string
  status: string
  visitType: string | null
  chiefComplaint: string | null
  visitDate: string
  createdAt: string
}

interface ScreeningQueueTableProps {
  data: QueueVisit[]
}

function formatWaitTime(createdAt: string, now: number): string {
  const waitMinutes = Math.round(
    (now - new Date(createdAt).getTime()) / 60000
  )
  return waitMinutes < 60
    ? `${waitMinutes} min`
    : `${Math.floor(waitMinutes / 60)}h ${waitMinutes % 60}m`
}

export function ScreeningQueueTable({ data }: ScreeningQueueTableProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <DataTable
      data={data}
      searchKeys={["patientName", "chiefComplaint"]}
      searchPlaceholder="Search by patient or complaint..."
      pageSize={10}
      columns={["Patient", "Type", "Status", "Chief Complaint", "Wait Time"]}
      renderRow={(visit) => (
        <tr key={visit.id}>
          <td className="px-4 py-3">
            <Link
              href={`/nurse/visits/${visit.id}/screening`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {visit.patientName}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
            {visit.visitType || "—"}
          </td>
          <td className="px-4 py-3">
            <StatusBadge
              status={
                visit.status as
                  | "waiting"
                  | "screening"
                  | "with_doctor"
                  | "completed"
              }
            />
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
            {visit.chiefComplaint || "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {formatWaitTime(visit.createdAt, now)}
          </td>
        </tr>
      )}
      emptyMessage="No patients waiting for screening"
    />
  )
}
