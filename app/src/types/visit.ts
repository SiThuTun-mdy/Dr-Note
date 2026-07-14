// Shared visit types — used across history, queue, and status badge components

export type VisitStatus = "waiting" | "screening" | "with_doctor" | "completed"

export interface DiagnosisBadge {
  code: string
  title: string
  type: "primary" | "secondary" | "suspected"
}
