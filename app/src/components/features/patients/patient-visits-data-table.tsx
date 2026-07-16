"use client"

import * as React from "react"
import { useTransition } from "react"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Stethoscope,
  CheckCircle2,
  Pill,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import type { VisitStatus } from "@/components/features/shared/StatusBadge"
import type { DiagnosisBadge } from "@/types/visit"
import { transitionVisitStatus } from "@/app/(dashboard)/queue/actions"
import { getAvailableActions } from "@/lib/utils/visit-actions"
import { getVisitDetail, type VisitDetail } from "@/app/(dashboard)/patients/[id]/actions"

export interface PatientVisitRow {
  id: string
  patientId: string
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
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Diagnosis badge (matches history timeline style)
// ---------------------------------------------------------------------------

const diagnosisTypeStyles: Record<string, string> = {
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  suspected: "bg-amber-100 text-amber-800",
}

function DiagnosisBadgeComponent({ d }: { d: DiagnosisBadge }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${diagnosisTypeStyles[d.type] ?? diagnosisTypeStyles.secondary}`}
      title={`${d.type}: ${d.title}`}
    >
      {d.code}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Expanded detail row
// ---------------------------------------------------------------------------

function ExpandedVisitDetail({ detail }: { detail: VisitDetail }) {
  const s = detail.screening
  const vitals = s
    ? [
        s.bp_systolic != null && s.bp_diastolic != null && { label: "BP", value: `${s.bp_systolic}/${s.bp_diastolic}` },
        s.heart_rate != null && { label: "HR", value: `${s.heart_rate} bpm` },
        s.temperature_c != null && { label: "Temp", value: `${s.temperature_c}°C` },
        s.oxygen_saturation != null && { label: "SpO₂", value: `${s.oxygen_saturation}%` },
        s.weight_kg != null && { label: "Weight", value: `${s.weight_kg} kg` },
        s.height_cm != null && { label: "Height", value: `${s.height_cm} cm` },
        s.bmi != null && { label: "BMI", value: Math.round(s.bmi).toString() },
      ].filter(Boolean) as Array<{ label: string; value: string }>
    : []

  return (
    <TableRow>
      <TableCell colSpan={5} className="bg-muted/20 p-0">
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visit details */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-foreground">Visit Details</h4>
            <div>
              <span className="text-muted-foreground">Chief complaint: </span>
              <span className="text-foreground">{detail.chief_complaint || "—"}</span>
            </div>
            {detail.diagnosis_note && (
              <div>
                <span className="text-muted-foreground">Doctor&apos;s note: </span>
                <span className="text-foreground">{detail.diagnosis_note}</span>
              </div>
            )}
            {detail.has_prescription && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Pill className="h-3 w-3" />
                Prescription issued
              </span>
            )}
          </div>

          {/* Screening vitals */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Screening
            </h4>
            {vitals.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {vitals.map((v) => (
                  <div key={v.label}>
                    <span className="text-muted-foreground">{v.label}: </span>
                    <span className="text-foreground">{v.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No screening recorded</p>
            )}
          </div>

          {/* Diagnoses */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-foreground">Diagnoses</h4>
            {detail.diagnoses.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {detail.diagnoses.map((d) => (
                  <DiagnosisBadgeComponent key={d.code} d={d} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No diagnoses recorded</p>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Visit row with expand toggle
// ---------------------------------------------------------------------------

function VisitRow({
  visit,
  userRole,
  onStatusUpdate,
  isExpanded,
  onToggle,
  detail,
}: {
  visit: PatientVisitRow
  userRole?: string | null
  onStatusUpdate?: () => void
  isExpanded: boolean
  onToggle: () => void
  detail: VisitDetail | null
}) {
  const [isPending, startTransition] = useTransition()
  const actions = getAvailableActions(visit.status as VisitStatus, userRole ?? null)

  function handleAction(targetStatus: VisitStatus) {
    startTransition(async () => {
      const result = await transitionVisitStatus(visit.id, targetStatus)
      if (result.success) {
        toast.success("Visit status updated")
        onStatusUpdate?.()
      } else {
        toast.error(result.error ?? "Failed to update status")
      }
    })
  }

  const actionIcons: Record<string, React.ReactNode> = {
    waiting_screening: <ClipboardCheck className="h-4 w-4" />,
    screening_with_doctor: <Stethoscope className="h-4 w-4" />,
    with_doctor_completed: <CheckCircle2 className="h-4 w-4" />,
  }

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <TableCell>
          <span className="inline-flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {formatVisitDate(visit.visitDate)}
          </span>
        </TableCell>
        <TableCell>
          <StatusBadge status={visit.status as VisitStatus} />
        </TableCell>
        <TableCell>{visit.visitType ?? "—"}</TableCell>
        <TableCell className="max-w-[200px] truncate">
          {visit.chiefComplaint ?? "—"}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const key = `${visit.status}_${action.target}`
              return (
                <Button
                  key={action.target}
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleAction(action.target)}
                >
                  {actionIcons[key]}
                  {action.label}
                </Button>
              )
            })}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        detail ? (
          <ExpandedVisitDetail detail={detail} />
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">
              Loading visit details…
            </TableCell>
          </TableRow>
        )
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sortable header
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main data table
// ---------------------------------------------------------------------------

interface PatientVisitsDataTableProps {
  data: PatientVisitRow[]
  userRole?: string | null
  onStatusUpdate?: () => void
}

export function PatientVisitsDataTable({ data, userRole, onStatusUpdate }: PatientVisitsDataTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey | null>("visitDate")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [details, setDetails] = React.useState<Record<string, VisitDetail>>({})
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

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

  async function handleToggle(visitId: string) {
    if (expandedId === visitId) {
      setExpandedId(null)
      return
    }
    setExpandedId(visitId)
    // Fetch detail if not cached
    if (!details[visitId]) {
      setLoadingId(visitId)
      try {
        const detail = await getVisitDetail(visitId)
        if (detail) {
          setDetails((prev) => ({ ...prev, [visitId]: detail }))
        } else {
          toast.error("Could not load visit details")
        }
      } catch (e) {
        toast.error("Failed to load visit details")
      } finally {
        setLoadingId(null)
      }
    }
  }

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
        "Actions",
      ]}
      renderRow={(visit) => (
        <VisitRow
          key={visit.id}
          visit={visit}
          userRole={userRole}
          onStatusUpdate={onStatusUpdate}
          isExpanded={expandedId === visit.id}
          onToggle={() => handleToggle(visit.id)}
          detail={details[visit.id] ?? null}
        />
      )}
      emptyMessage="No visits found."
    />
  )
}
