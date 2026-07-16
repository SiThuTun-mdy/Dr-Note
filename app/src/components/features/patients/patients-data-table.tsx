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

/** Format age from DOB: years, months, or days depending on how young. */
function formatAge(dob: string | null): string | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  const diffMs = now.getTime() - birth.getTime()
  if (diffMs < 0) return null
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 30) return `${diffDays}d`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo`
  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y`
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
          <TableCell>
            {patient.dob ? (
              <div>
                <span>{patient.dob}</span>
                {formatAge(patient.dob) && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatAge(patient.dob)})
                  </span>
                )}
              </div>
            ) : "—"}
          </TableCell>
          <TableCell>{patient.gender ?? "—"}</TableCell>
          <TableCell className="text-right">
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
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
