"use client"

import Link from "next/link"
import * as React from "react"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"

export interface PatientTableRow {
  id: string
  name: string
  email: string
  phone: string | null
  dob: string | null
  gender: string | null
}

type SortKey = "name" | "email"
type SortDirection = "asc" | "desc"

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: SortKey
  activeKey: SortKey | null
  direction: SortDirection
  onSort: (key: SortKey) => void
}) {
  return (
    <Button variant="ghost" onClick={() => onSort(sortKey)}>
      {label}
      <ArrowUpDown
        className={
          activeKey === sortKey
            ? direction === "asc"
              ? "rotate-180"
              : ""
            : "opacity-50"
        }
      />
    </Button>
  )
}

export function PatientsDataTable({ data }: { data: PatientTableRow[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")

  const handleSort = React.useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      } else {
        setSortKey(key)
        setSortDirection("asc")
      }
    },
    [sortKey]
  )

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data
    const sorted = [...data].sort((a, b) => {
      const [valueA, valueB] =
        sortKey === "name" ? [a.name, b.name] : [a.email, b.email]
      return valueA.localeCompare(valueB)
    })
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }, [data, sortKey, sortDirection])

  return (
    <DataTable
      data={sortedData}
      searchKeys={["name", "email", "phone", "dob", "gender"]}
      searchPlaceholder="Filter patients..."
      pageSize={10}
      columns={[
        <SortableHeader
          key="name"
          label="Name"
          sortKey="name"
          activeKey={sortKey}
          direction={sortDirection}
          onSort={handleSort}
        />,
        <SortableHeader
          key="email"
          label="Email"
          sortKey="email"
          activeKey={sortKey}
          direction={sortDirection}
          onSort={handleSort}
        />,
        "Phone",
        "DOB",
        "Gender",
        "",
      ]}
      renderRow={(patient) => (
        <TableRow key={patient.id}>
          <TableCell>{patient.name}</TableCell>
          <TableCell>{patient.email}</TableCell>
          <TableCell>{patient.phone ?? "—"}</TableCell>
          <TableCell>{patient.dob ?? "—"}</TableCell>
          <TableCell>{patient.gender ?? "—"}</TableCell>
          <TableCell className="text-right">
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/patients/${patient.id}`} />}
            >
              View
            </Button>
          </TableCell>
        </TableRow>
      )}
      emptyMessage="No patients found."
    />
  )
}
