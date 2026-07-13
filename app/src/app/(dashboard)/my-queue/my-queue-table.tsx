"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import type { QueueVisitData } from "./page"

interface MyQueueTableProps {
  data: QueueVisitData[]
}

export function MyQueueTable({ data }: MyQueueTableProps) {
  return (
    <DataTable
      data={data}
      searchKeys={["patientName", "chief_complaint"]}
      searchPlaceholder="Search by patient or complaint..."
      pageSize={10}
      columns={["Patient", "Type", "Status", "Chief Complaint", "Date"]}
      renderRow={(visit) => (
        <tr key={visit.id}>
          <td className="px-4 py-3">
            <Link
              href={`/doctor/visits/${visit.id}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {visit.patientName}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
            {visit.visit_type || "—"}
          </td>
          <td className="px-4 py-3">
            <StatusBadge status={visit.status} />
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
            {visit.chief_complaint || "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {new Date(visit.visit_date).toLocaleDateString()}
          </td>
        </tr>
      )}
      emptyMessage="No visits in your queue"
    />
  )
}
