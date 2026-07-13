import { createClient } from "@/lib/supabase/server";
import { PrescriptionsTable } from "./prescriptions-table";

export interface PrescriptionData {
  id: string;
  visit_id: string;
  doctor_id: string;
  diagnosis_id: string | null;
  instruction: string | null;
  created_at: string;
  diagnosisCode: string | null;
  diagnosisTitle: string | null;
  itemCount: number;
  patientName: string;
  doctorName: string;
}

export default async function PrescriptionsPage() {
  const supabase = await createClient();

  // Fetch ALL prescriptions
  const { data: prescriptions, error } = await supabase
    .from("prescriptions")
    .select(`
      id,
      visit_id,
      doctor_id,
      diagnosis_id,
      instruction,
      created_at,
      diagnosis:diagnoses(code, title),
      items:prescription_items(id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching prescriptions:", error);
  }

  // Fetch doctor names
  const doctorIds = [...new Set((prescriptions || []).map(p => p.doctor_id).filter(Boolean))];
  const { data: doctors } = doctorIds.length > 0
    ? await supabase.from("users").select("id, name").in("id", doctorIds)
    : { data: [] };
  const doctorMap = new Map(doctors?.map(d => [d.id, d.name]) || []);

  // Fetch patient names via visits
  const visitIds = [...new Set((prescriptions || []).map(p => p.visit_id).filter(Boolean))];
  const { data: visits } = visitIds.length > 0
    ? await supabase.from("visits").select("id, patient_id").in("id", visitIds)
    : { data: [] };

  const patientIds = [...new Set((visits || []).map(v => v.patient_id).filter(Boolean))];
  const { data: patients } = patientIds.length > 0
    ? await supabase.from("users").select("id, name").in("id", patientIds)
    : { data: [] };

  const visitPatientMap = new Map(
    (visits || []).map(v => {
      const patient = (patients || []).find(p => p.id === v.patient_id);
      return [v.id, patient?.name || "Unknown"];
    })
  );

  const enrichedPrescriptions: PrescriptionData[] = (prescriptions || []).map(rx => ({
    id: rx.id,
    visit_id: rx.visit_id,
    doctor_id: rx.doctor_id,
    diagnosis_id: rx.diagnosis_id,
    instruction: rx.instruction,
    created_at: rx.created_at,
    diagnosisCode: (rx.diagnosis as { code?: string } | null)?.code || null,
    diagnosisTitle: (rx.diagnosis as { title?: string } | null)?.title || null,
    itemCount: rx.items?.length || 0,
    patientName: visitPatientMap.get(rx.visit_id) || "Unknown",
    doctorName: doctorMap.get(rx.doctor_id) || "—",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Prescriptions</h1>
        <p className="text-muted-foreground">View all prescriptions</p>
      </div>
      <PrescriptionsTable data={enrichedPrescriptions} />
    </div>
  );
}
