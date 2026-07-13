import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  // Get total count
  const { count } = await supabase
    .from("prescriptions")
    .select("id", { count: "exact", head: true });

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  // Fetch paginated prescriptions
  const { data: prescriptions, error } = await supabase
    .from("prescriptions")
    .select(`
      id,
      visit_id,
      doctor_id,
      diagnosis_id,
      instruction,
      created_at,
      diagnosis:diagnoses(id, code, title),
      items:prescription_items(medicine_name, dosage, frequency, duration, route, quantity)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Prescriptions</h1>
        <p className="text-muted-foreground">View all prescriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {!prescriptions || prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prescriptions found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="emr-table-header">
                      <th className="text-left px-4 py-3" scope="col">Patient</th>
                      <th className="text-left px-4 py-3" scope="col">Doctor</th>
                      <th className="text-left px-4 py-3" scope="col">Diagnosis</th>
                      <th className="text-left px-4 py-3" scope="col">Medicines</th>
                      <th className="text-left px-4 py-3" scope="col">Date</th>
                      <th className="text-left px-4 py-3" scope="col">Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">
                          {visitPatientMap.get(rx.visit_id) || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {doctorMap.get(rx.doctor_id) || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {(rx.diagnosis as any)?.code
                            ? `${(rx.diagnosis as any).code} — ${(rx.diagnosis as any).title}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {rx.items?.length || 0} item(s)
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(rx.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/doctor/visits/${rx.visit_id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/prescriptions"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
