// Status badge component — design system §2, §3
// Same status = same badge everywhere in the app

interface StatusBadgeProps {
  status: "waiting" | "screening" | "with_doctor" | "completed"
}

const statusStyles: Record<string, string> = {
  waiting: "bg-amber-100 text-amber-800",
  screening: "bg-sky-100 text-sky-800",
  with_doctor: "bg-violet-100 text-violet-800",
  completed: "bg-green-100 text-green-800",
}

const statusLabels: Record<string, string> = {
  waiting: "Waiting",
  screening: "Screening",
  with_doctor: "With doctor",
  completed: "Completed",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}
