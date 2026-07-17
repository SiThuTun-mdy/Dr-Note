import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server";
import { MyQueueTable } from "./my-queue-table";

export const metadata: Metadata = {
  title: "My Queue",
  description: "Your assigned patient visits for today",
};

export interface QueueVisitData {
  id: string;
  patient_id: string;
  visit_type: string | null;
  status: "waiting" | "screening" | "with_doctor" | "completed";
  chief_complaint: string | null;
  visit_date: string;
  patientName: string;
}

interface PageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function MyQueuePage({ searchParams }: PageProps) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Parse date from query param, default to today
  const params = await searchParams;
  const dateStr = params?.date;
  const targetDate = new Date();
  if (dateStr) {
    // Parse YYYY-MM-DD in local timezone (not UTC)
    const [year, month, day] = dateStr.split("-").map(Number);
    targetDate.setFullYear(year, month - 1, day);
  }
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Fetch visits for this doctor on the selected date
  const { data: visits, error } = await supabase
    .from("visits")
    .select("id, patient_id, visit_type, status, chief_complaint, visit_date")
    .eq("doctor_id", user?.id || "")
    .neq("status", "waiting")
    .gte("visit_date", startOfDay.toISOString())
    .lt("visit_date", endOfDay.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[MyQueuePage] Error fetching queue:", error.message, { doctor_id: user?.id });
  }

  // Enrich with patient names
  const patientIds = [...new Set((visits || []).map((v) => v.patient_id))];
  let patientMap: Record<string, string> = {};

  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from("users")
      .select("id, name")
      .in("id", patientIds);

    if (patients) {
      patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]));
    }
  }

  const enrichedVisits: QueueVisitData[] = (visits || []).map((visit) => ({
    ...visit,
    patientName: patientMap[visit.patient_id] || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">My Queue</h1>
        <p className="text-muted-foreground">Your assigned patient visits for today</p>
      </div>
      <MyQueueTable data={enrichedVisits} selectedDate={startOfDay} />
    </div>
  );
}
