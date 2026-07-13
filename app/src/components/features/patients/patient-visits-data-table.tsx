"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface PatientVisitRow {
  id: string
  visitDate: string
  status: string
  visitType: string | null
  chiefComplaint: string | null
}

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

const columns: ColumnDef<PatientVisitRow>[] = [
  {
    accessorKey: "visitDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Visit date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => formatVisitDate(row.original.visitDate),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge className={statusClassName(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "visitType",
    header: "Visit type",
    cell: ({ row }) => row.original.visitType ?? "—",
  },
  {
    accessorKey: "chiefComplaint",
    header: "Chief complaint",
    cell: ({ row }) => row.original.chiefComplaint ?? "—",
  },
]

export function PatientVisitsDataTable({ data }: { data: PatientVisitRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "visitDate", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = React.useState("")

  // TanStack table intentionally returns non-memoizable APIs.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Filter visits..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
          aria-label="Filter visits"
        />
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} visit
          {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No visits found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
