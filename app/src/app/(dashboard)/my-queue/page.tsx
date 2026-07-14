import { createClient } from "@/lib/supabase/server";
import { MyQueueTable } from "./my-queue-table";

export interface QueueVisitData {
  id: string;
  patient_id: string;
  visit_type: string | null;
  status: "waiting" | "screening" | "with_doctor" | "completed";
  chief_complaint: string | null;
  visit_date: string;
  patientName: string;
}

export default async function MyQueuePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch ALL visits for this doctor
  const { data: visits, error } = await supabase
    .from("visits")
    .select("*")
    .eq("doctor_id", user?.id || "")
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching my queue:", error);
  }

  // Enrich with patient names
  const enrichedVisits: QueueVisitData[] = await Promise.all(
    (visits || []).map(async (visit) => {
      const { data: patient } = await supabase
        .from("users")
        .select("name")
        .eq("id", visit.patient_id)
        .single();

      return {
        ...visit,
        patientName: patient?.name || "Unknown",
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">My Queue</h1>
        <p className="text-muted-foreground">Your assigned patient visits</p>
      </div>
      <MyQueueTable data={enrichedVisits} />
    </div>
  );
}
