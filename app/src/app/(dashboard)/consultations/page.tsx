import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server";
import { ConsultationsTable } from "./consultations-table";

export const metadata: Metadata = {
  title: "Consultations",
  description: "View and manage patient consultations",
};

export interface EnrichedVisit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_type: string | null;
  status: "waiting" | "screening" | "with_doctor" | "completed";
  chief_complaint: string | null;
  visit_date: string;
  created_at: string;
  patientName: string;
  patientEmail: string;
  doctorName: string | null;
}

type TabValue = "mine" | "unassigned" | "all";

interface PageProps {
  searchParams?: Promise<{ tab?: string; status?: string }>;
}

export default async function ConsultationsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  // Get current user and role
  const { data: { user } } = await supabase.auth.getUser();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user?.id || "")
    .limit(1);

  const roleName = (roles?.[0] as unknown as { roles: { name: string } | null })?.roles?.name;
  const isAdmin = roleName === "admin";

  // Parse search params
  const params = await searchParams;
  const tab = (params?.tab as TabValue) || (isAdmin ? "all" : "mine");
  const statusFilter = params?.status || "all";

  // Build query based on tab
  let query = supabase
    .from("visits")
    .select("id, patient_id, doctor_id, visit_type, status, chief_complaint, visit_date, created_at");

  if (tab === "mine") {
    query = query.eq("doctor_id", user?.id || "");
  } else if (tab === "unassigned") {
    query = query.is("doctor_id", null).eq("status", "screening");
  }
  // "all" — no doctor filter

  // Status filter
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: visits, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("[ConsultationsPage] Error fetching visits:", error.message);
  }

  // Batch-fetch patient and doctor names (N+1 fix)
  const patientIds = [...new Set((visits || []).map((v) => v.patient_id))];
  const doctorIds = [...new Set((visits || []).map((v) => v.doctor_id).filter(Boolean))];

  let patientMap: Record<string, { name: string; email: string }> = {};
  let doctorMap: Record<string, string> = {};

  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", patientIds);

    if (patients) {
      patientMap = Object.fromEntries(patients.map((p) => [p.id, { name: p.name, email: p.email }]));
    }
  }

  if (doctorIds.length > 0) {
    const { data: doctors } = await supabase
      .from("users")
      .select("id, name")
      .in("id", doctorIds);

    if (doctors) {
      doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d.name]));
    }
  }

  const enrichedVisits: EnrichedVisit[] = (visits || []).map((visit) => ({
    ...visit,
    patientName: patientMap[visit.patient_id]?.name || "Unknown",
    patientEmail: patientMap[visit.patient_id]?.email || "",
    doctorName: visit.doctor_id ? doctorMap[visit.doctor_id] || null : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Consultations</h1>
        <p className="text-muted-foreground">View and manage patient consultations</p>
      </div>
      <ConsultationsTable
        data={enrichedVisits}
        activeTab={tab}
        activeStatus={statusFilter}
        isAdmin={isAdmin}
      />
    </div>
  );
}
