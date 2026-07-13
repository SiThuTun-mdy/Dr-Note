import { createClient } from "@/lib/supabase/server";
import { PatientsTable } from "./patients-table";

export interface PatientData {
  userId: string;
  name: string;
  email: string;
  nrc: string | null;
  dob: string | null;
  gender: string | null;
  isActive: boolean;
}

export default async function PatientsPage() {
  const supabase = await createClient();

  // Fetch ALL patient profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("patient_profiles")
    .select("user_id, nrc, dob, gender");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Fetch user data for these patients
  const userIds = profiles?.map(p => p.user_id) || [];
  const { data: users } = userIds.length > 0
    ? await supabase.from("users").select("id, name, email, is_active").in("id", userIds)
    : { data: [] };

  const userMap = new Map(users?.map(u => [u.id, u]) || []);

  const patients: PatientData[] = (profiles || []).map(p => ({
    userId: p.user_id,
    name: userMap.get(p.user_id)?.name || "Unknown",
    email: userMap.get(p.user_id)?.email || "—",
    nrc: p.nrc,
    dob: p.dob,
    gender: p.gender,
    isActive: userMap.get(p.user_id)?.is_active ?? false,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Manage patient records</p>
      </div>
      <PatientsTable data={patients} />
    </div>
  );
}
