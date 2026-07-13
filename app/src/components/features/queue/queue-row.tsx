"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { ClipboardCheck, Stethoscope, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import type { VisitStatus } from "@/components/features/shared/StatusBadge"
import {
  transitionVisitStatus,
  type VisitRow,
} from "@/app/(dashboard)/queue/actions"

interface QueueRowProps {
  visit: VisitRow
  userRole: string | null
  onTransitionComplete: () => void
}

/** Human-readable label for the transition action button. */
const actionLabel: Record<string, { label: string; icon: React.ReactNode }> = {
  waiting_screening: {
    label: "Start screening",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  screening_with_doctor: {
    label: "Start consult",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  with_doctor_completed: {
    label: "Complete",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
}

/**
 * Determine which transition actions the current user can perform on a visit.
 * Returns tuples of [targetStatus, label, icon].
 */
function getAvailableActions(
  status: VisitStatus,
  userRole: string | null
): Array<{ target: VisitStatus; label: string; icon: React.ReactNode }> {
  if (!userRole) return []

  const roleActions: Record<string, Array<[VisitStatus, VisitStatus]>> = {
    nurse: [["waiting", "screening"]],
    doctor: [
      ["screening", "with_doctor"],
      ["with_doctor", "completed"],
    ],
    admin: [
      ["waiting", "screening"],
      ["screening", "with_doctor"],
      ["with_doctor", "completed"],
    ],
  }

  const allowed = roleActions[userRole] ?? []
  return allowed
    .filter(([from]) => from === status)
    .map(([from, to]) => {
      const key = `${from}_${to}`
      const action = actionLabel[key]
      return { target: to, label: action?.label ?? to, icon: action?.icon ?? null }
    })
}

/** Format created_at into a short time string (e.g. "10:30 AM"). */
function formatTime(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function QueueRow({
  visit,
  userRole,
  onTransitionComplete,
}: QueueRowProps) {
  const [isPending, startTransition] = useTransition()
  const actions = getAvailableActions(visit.status, userRole)

  function handleAction(targetStatus: VisitStatus) {
    startTransition(async () => {
      const result = await transitionVisitStatus(visit.id, targetStatus)
      if (result.success) {
        toast.success("Visit status updated")
        onTransitionComplete()
      } else {
        toast.error(result.error ?? "Failed to update status")
      }
    })
  }

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
        {visit.id.slice(0, 8)}…
      </td>
      <td className="px-4 py-3 text-sm font-medium">{visit.patient_name}</td>
      <td className="px-4 py-3">
        <StatusBadge status={visit.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {visit.chief_complaint ?? "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {visit.doctor_name ?? "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatTime(visit.created_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.target}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleAction(action.target)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </td>
    </tr>
  )
}
