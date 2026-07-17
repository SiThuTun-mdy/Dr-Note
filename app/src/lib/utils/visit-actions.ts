import type { VisitStatus } from "@/components/features/shared/StatusBadge"

/** Human-readable label for the transition action button. */
const actionLabel: Record<string, string> = {
  waiting_screening: "Start screening",
  screening_with_doctor: "Start consult",
  with_doctor_completed: "Complete",
}

/**
 * Determine which transition actions the current user can perform on a visit.
 * Returns tuples of [targetStatus, label].
 */
export function getAvailableActions(
  status: VisitStatus,
  userRole: string | null
): Array<{ target: VisitStatus; label: string }> {
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
      return { target: to, label: actionLabel[key] ?? to }
    })
}

