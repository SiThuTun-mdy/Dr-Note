"use client"

import { useState, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PaginationControls } from "@/components/ui/pagination-controls"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<T> {
  /** Full dataset (already loaded) */
  data: T[]
  /** Keys to search on (client-side text match) */
  searchKeys?: (keyof T & string)[]
  searchPlaceholder?: string
  /** Rows per page (default 10) */
  pageSize?: number
  /** Extra filter UI (e.g. status dropdown) */
  filters?: React.ReactNode
  /** Column headers — use <TableHead> elements */
  columns: React.ReactNode[]
  /** Render a single table body row — must return <TableRow> with <TableCell> children */
  renderRow: (item: T, index: number) => React.ReactNode
  /** Shown when filtered data is empty */
  emptyMessage?: string
  /** Additional CSS class on the wrapper */
  className?: string
}

export function DataTable<T>({
  data,
  searchKeys = [],
  searchPlaceholder = "Search...",
  pageSize = 10,
  filters,
  columns,
  renderRow,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data

    const query = search.toLowerCase()
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key]
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [data, search, searchKeys])

  // Reset to page 1 when search changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      setCurrentPage(1)
    },
    []
  )

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )

  return (
    <div className={className}>
      {/* Toolbar: search + filters */}
      <div className="flex items-center gap-4 mb-4">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        )}
        {filters}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col, i) => (
                <TableHead key={i}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, idx) =>
                renderRow(item, (safePage - 1) * pageSize + idx)
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
