"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/features/shared/StatusBadge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EnrichedVisit } from "./page"

interface ConsultationsTableProps {
  data: EnrichedVisit[]
  activeTab: string
  activeStatus: string
  isAdmin: boolean
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "screening", label: "Screening" },
  { value: "with_doctor", label: "With doctor" },
  { value: "completed", label: "Completed" },
];

export function ConsultationsTable({
  data,
  activeTab,
  activeStatus,
  isAdmin,
}: ConsultationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParam = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if (value === "all" || (key === "tab" && value === (isAdmin ? "all" : "mine"))) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    router.push(`${pathname}?${url.searchParams.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Tabs + Status filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(val) => updateParam("tab", val)}
        >
          <TabsList>
            <TabsTrigger value="mine">My consultations</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            {isAdmin && <TabsTrigger value="all">All</TabsTrigger>}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select
            value={activeStatus}
            onValueChange={(val) => updateParam("status", val ?? "all")}
            items={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(activeTab !== (isAdmin ? "all" : "mine") || activeStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(pathname)}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        searchKeys={["patientName", "patientEmail", "chief_complaint", "doctorName"]}
        searchPlaceholder="Search by patient, complaint, or doctor..."
        pageSize={10}
        columns={["Patient", "Type", "Status", "Chief Complaint", "Doctor", "Date"]}
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
            <td className="px-4 py-3 text-sm text-muted-foreground">
              {visit.doctorName || (
                <span className="text-amber-600 dark:text-amber-400">Unassigned</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground">
              {new Date(visit.visit_date).toLocaleDateString()}
            </td>
          </tr>
        )}
        emptyMessage={
          activeTab === "mine"
            ? "No consultations assigned to you"
            : activeTab === "unassigned"
              ? "No unassigned visits"
              : "No consultations found"
        }
      />
    </div>
  )
}
