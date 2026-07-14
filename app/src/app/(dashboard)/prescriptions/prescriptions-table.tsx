"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import type { PrescriptionData } from "./page"

interface PrescriptionsTableProps {
  data: PrescriptionData[]
}

export function PrescriptionsTable({ data }: PrescriptionsTableProps) {
  return (
    <DataTable
      data={data}
      searchKeys={["patientName", "doctorName", "diagnosisCode", "diagnosisTitle"]}
      searchPlaceholder="Search by patient, doctor, or diagnosis..."
      pageSize={10}
      columns={["Patient", "Doctor", "Diagnosis", "Medicines", "Date", "Visit"]}
      renderRow={(rx) => (
        <tr key={rx.id}>
          <td className="px-4 py-3 text-sm font-medium">
            {rx.patientName}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {rx.doctorName}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {rx.diagnosisCode
              ? `${rx.diagnosisCode} — ${rx.diagnosisTitle}`
              : "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {rx.itemCount} item(s)
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {new Date(rx.created_at).toLocaleDateString()}
          </td>
          <td className="px-4 py-3">
            <Link
              href={`/doctor/visits/${rx.visit_id}`}
              className="text-sm text-primary hover:underline"
            >
              View
            </Link>
          </td>
        </tr>
      )}
      emptyMessage="No prescriptions found"
    />
  )
}
