import { createClient } from "@/lib/supabase/server";
import { ConsultationsTable } from "./consultations-table";

export interface EnrichedVisit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_type: string | null;
  status: "waiting" | "screening" | "with_doctor" | "completed";
  chief_complaint: string | null;
  visit_date: string;
  patientName: string;
  patientEmail: string;
  doctorName: string | null;
}

export default async function ConsultationsPage() {
  const supabase = await createClient();

  // Fetch ALL visits (no server pagination)
  const { data: visits, error } = await supabase
    .from("visits")
    .select("*")
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching visits:", error);
  }

  // Fetch patient and doctor names
  const enrichedVisits: EnrichedVisit[] = await Promise.all(
    (visits || []).map(async (visit) => {
      const { data: patient } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", visit.patient_id)
        .single();

      let doctorName = null;
      if (visit.doctor_id) {
        const { data } = await supabase
          .from("users")
          .select("name")
          .eq("id", visit.doctor_id)
          .single();
        doctorName = data?.name || null;
      }

      return {
        ...visit,
        patientName: patient?.name || "Unknown",
        patientEmail: patient?.email || "",
        doctorName,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Consultations</h1>
        <p className="text-muted-foreground">View and manage patient consultations</p>
      </div>
      <ConsultationsTable data={enrichedVisits} />
    </div>
  );
}
