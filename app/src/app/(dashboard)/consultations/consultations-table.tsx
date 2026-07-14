"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import type { EnrichedVisit } from "./page"

interface ConsultationsTableProps {
  data: EnrichedVisit[]
}

export function ConsultationsTable({ data }: ConsultationsTableProps) {
  return (
    <DataTable
      data={data}
      searchKeys={["patientName", "patientEmail", "chief_complaint", "doctorName"]}
      searchPlaceholder="Search by patient, complaint, or doctor..."
      pageSize={10}
      columns={["Patient", "Type", "Status", "Chief Complaint", "Doctor", "Date"]}
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
            {visit.doctorName || "Unassigned"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {new Date(visit.visit_date).toLocaleDateString()}
          </td>
        </tr>
      )}
      emptyMessage="No consultations found"
    />
  )
}
