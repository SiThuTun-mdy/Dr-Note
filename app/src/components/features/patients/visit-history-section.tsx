"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  PatientVisitsDataTable,
  type PatientVisitRow,
} from "./patient-visits-data-table"

interface VisitHistorySectionProps {
  visits: PatientVisitRow[]
  userRole: string | null
  hasError: boolean
}

export function VisitHistorySection({
  visits,
  userRole,
  hasError,
}: VisitHistorySectionProps) {
  const router = useRouter()

  const handleStatusUpdate = useCallback(() => {
    router.refresh()
  }, [router])

  if (hasError) {
    return (
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t load visit history right now. Please try again.
      </p>
    )
  }

  return (
    <PatientVisitsDataTable
      data={visits}
      userRole={userRole}
      onStatusUpdate={handleStatusUpdate}
    />
  )
}
