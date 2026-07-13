"use client"

import { DataTable } from "@/components/ui/data-table"
import type { PatientData } from "./page"

interface PatientsTableProps {
  data: PatientData[]
}

export function PatientsTable({ data }: PatientsTableProps) {
  return (
    <DataTable
      data={data}
      searchKeys={["name", "email", "nrc"]}
      searchPlaceholder="Search by name, email, or NRC..."
      pageSize={10}
      columns={["Name", "Email", "NRC", "DOB", "Gender", "Status"]}
      renderRow={(patient) => (
        <tr key={patient.userId}>
          <td className="px-4 py-3 text-sm font-medium">
            {patient.name}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {patient.email}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {patient.nrc || "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {patient.dob ? new Date(patient.dob).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
            {patient.gender || "—"}
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              patient.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {patient.isActive ? "Active" : "Inactive"}
            </span>
          </td>
        </tr>
      )}
      emptyMessage="No patients found"
    />
  )
}
