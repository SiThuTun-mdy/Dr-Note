"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { QueueVisitData } from "./page"

interface MyQueueTableProps {
  data: QueueVisitData[]
  selectedDate: Date
  basePath?: string
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function MyQueueTable({ data, selectedDate, basePath = "/my-queue" }: MyQueueTableProps) {
  const router = useRouter();

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -1 : 1));
    router.push(`${basePath}?date=${formatDate(newDate)}`);
  };

  const handleToday = () => {
    router.push(basePath);
  };

  const dateLabel = isToday(selectedDate)
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDateChange("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {dateLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDateChange("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday(selectedDate) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleToday}
            >
              Go to today
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={data}
        searchKeys={["patientName", "chief_complaint"]}
        searchPlaceholder="Search by patient or complaint..."
        pageSize={10}
        columns={["Patient", "Type", "Status", "Chief Complaint"]}
        renderRow={(visit) => (
          <tr key={visit.id}>
            <td className="px-4 py-3">
              <Link
                href={`/doctor/visits/${visit.id}`}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {visit.patientName}
              </Link>
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
              {visit.visit_type || "—"}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={visit.status} />
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
              {visit.chief_complaint || "—"}
            </td>
          </tr>
        )}
        emptyMessage="No visits for this day"
      />
    </div>
  )
}
