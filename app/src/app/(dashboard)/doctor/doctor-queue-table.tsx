"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"

interface QueueVisit {
  id: string
  patientName: string
  status: string
  chiefComplaint: string | null
  visitDate: string
}

interface DoctorQueueTableProps {
  data: QueueVisit[]
}

export function DoctorQueueTable({ data }: DoctorQueueTableProps) {
  return (
    <DataTable
      data={data}
      searchKeys={["patientName", "chiefComplaint"]}
      searchPlaceholder="Search by patient or complaint..."
      pageSize={10}
      columns={["Patient", "Status", "Reason", "Visit Date"]}
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
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {visit.chiefComplaint || "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {new Date(visit.visitDate).toLocaleDateString()}
          </td>
        </tr>
      )}
      emptyMessage="No patients in queue"
    />
  )
}
