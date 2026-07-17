import type { Metadata } from "next"
import { HistoryPageContent } from "@/components/features/history/history-page-content"

export const metadata: Metadata = {
  title: "History",
  description: "Patient visit history",
}

export default function HistoryPage() {
  return <HistoryPageContent />
}
