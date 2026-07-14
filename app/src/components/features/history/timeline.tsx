"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  User,
  Pill,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import { getPatientHistory, type VisitHistoryRow } from "@/app/(dashboard)/history/actions"
import type { VisitStatus } from "@/types/visit"

// ---------------------------------------------------------------------------
// Diagnosis badge component
// ---------------------------------------------------------------------------

const diagnosisTypeStyles: Record<string, string> = {
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  suspected: "bg-amber-100 text-amber-800",
}

function DiagnosisBadge({
  code,
  title,
  type,
}: {
  code: string
  title: string
  type: string
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${diagnosisTypeStyles[type] || diagnosisTypeStyles.secondary}`}
      title={`${type}: ${title}`}
    >
      {code}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Single visit row in the timeline
// ---------------------------------------------------------------------------

function VisitTimelineRow({
  visit,
  isExpanded,
  onToggle,
}: {
  visit: VisitHistoryRow
  isExpanded: boolean
  onToggle: () => void
}) {
  function formatDate(isoDate: string): string {
    const d = new Date(isoDate)
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header row — always visible, clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[140px]">
          <Calendar className="h-4 w-4" />
          {formatDate(visit.visit_date)}
        </div>

        <StatusBadge status={visit.status} />

        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[140px]">
          <User className="h-4 w-4" />
          {visit.doctor_name ?? "Unassigned"}
        </div>

        <p className="flex-1 text-sm text-foreground truncate">
          {visit.chief_complaint || "No chief complaint"}
        </p>

        {/* Diagnosis badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {visit.diagnoses.slice(0, 3).map((d) => (
            <DiagnosisBadge
              key={d.code}
              code={d.code}
              title={d.title}
              type={d.type}
            />
          ))}
          {visit.diagnoses.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{visit.diagnoses.length - 3}
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Visit details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Visit Details
              </h4>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Chief complaint: </span>
                  <span className="text-foreground">
                    {visit.chief_complaint || "—"}
                  </span>
                </div>

                {visit.diagnosis_note && (
                  <div>
                    <span className="text-muted-foreground">
                      Doctor&apos;s note:{" "}
                    </span>
                    <span className="text-foreground">
                      {visit.diagnosis_note}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {visit.has_prescription && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Pill className="h-3 w-3" />
                      Prescription issued
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Diagnoses */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Diagnoses
              </h4>

              {visit.diagnoses.length > 0 ? (
                <div className="space-y-1">
                  {visit.diagnoses.map((d) => (
                    <div
                      key={d.code}
                      className="flex items-center gap-2 text-sm"
                    >
                      <DiagnosisBadge
                        code={d.code}
                        title={d.title}
                        type={d.type}
                      />
                      <span className="text-foreground">{d.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({d.type})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No diagnoses recorded
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main timeline component
// ---------------------------------------------------------------------------

interface PatientTimelineProps {
  patientId: string
}

export function PatientTimeline({ patientId }: PatientTimelineProps) {
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patient-history", patientId],
    queryFn: () => getPatientHistory(patientId),
  })

  // Loading skeleton — design system §6
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    )
  }

  // Error state — design system §6
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive mb-4">
          Failed to load patient history. Please try again.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const visits = data?.data ?? []

  // Empty state — design system §6
  if (visits.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No visits yet
        </h3>
        <p className="text-sm text-muted-foreground">
          This patient has no consultation history.
        </p>
      </div>
    )
  }

  function handleToggle(visitId: string) {
    setExpandedVisitId((prev) => (prev === visitId ? null : visitId))
  }

  return (
    <div className="space-y-2">
      {visits.map((visit) => (
        <VisitTimelineRow
          key={visit.id}
          visit={visit}
          isExpanded={expandedVisitId === visit.id}
          onToggle={() => handleToggle(visit.id)}
        />
      ))}
    </div>
  )
}
