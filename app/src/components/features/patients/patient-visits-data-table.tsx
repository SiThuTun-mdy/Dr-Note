"use client"

import * as React from "react"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"

export interface PatientVisitRow {
  id: string
  visitDate: string
  status: string
  visitType: string | null
  chiefComplaint: string | null
}

type SortKey = "visitDate" | "status"
type SortDirection = "asc" | "desc"

function formatVisitDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function statusClassName(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_consultation":
      return "bg-blue-100 text-blue-800"
    case "screening":
      return "bg-amber-100 text-amber-800"
    case "waiting":
      return "bg-slate-100 text-slate-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

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

export function PatientVisitsDataTable({ data }: { data: PatientVisitRow[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey | null>("visitDate")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc")

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
        sortKey === "visitDate"
          ? [a.visitDate, b.visitDate]
          : [a.status, b.status]
      return valueA.localeCompare(valueB)
    })
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }, [data, sortKey, sortDirection])

  return (
    <DataTable
      data={sortedData}
      searchKeys={["status", "visitType", "chiefComplaint"]}
      searchPlaceholder="Filter visits..."
      pageSize={10}
      columns={[
        <SortableHeader
          key="visitDate"
          label="Visit date"
          sortKey="visitDate"
          activeKey={sortKey}
          direction={sortDirection}
          onSort={handleSort}
        />,
        <SortableHeader
          key="status"
          label="Status"
          sortKey="status"
          activeKey={sortKey}
          direction={sortDirection}
          onSort={handleSort}
        />,
        "Visit type",
        "Chief complaint",
      ]}
      renderRow={(visit) => (
        <TableRow key={visit.id}>
          <TableCell>{formatVisitDate(visit.visitDate)}</TableCell>
          <TableCell>
            <Badge className={statusClassName(visit.status)}>
              {visit.status}
            </Badge>
          </TableCell>
          <TableCell>{visit.visitType ?? "—"}</TableCell>
          <TableCell>{visit.chiefComplaint ?? "—"}</TableCell>
        </TableRow>
      )}
      emptyMessage="No visits found."
    />
  )
}
