import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

export default async function ConsultationsPage({
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
    .from("visits")
    .select("id", { count: "exact", head: true });

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  // Fetch paginated visits
  const { data: visits, error } = await supabase
    .from("visits")
    .select("*")
    .order("visit_date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching visits:", error);
  }

  // Fetch patient and doctor names
  const enrichedVisits = await Promise.all(
    (visits || []).map(async (visit) => {
      const { data: patient } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", visit.patient_id)
        .single();

      let doctor = null;
      if (visit.doctor_id) {
        const { data } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", visit.doctor_id)
          .single();
        doctor = data;
      }

      return { ...visit, patient, doctor };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Consultations</h1>
        <p className="text-muted-foreground">View and manage patient consultations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {!enrichedVisits || enrichedVisits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No consultations found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="emr-table-header">
                      <th className="text-left px-4 py-3" scope="col">Patient</th>
                      <th className="text-left px-4 py-3" scope="col">Type</th>
                      <th className="text-left px-4 py-3" scope="col">Status</th>
                      <th className="text-left px-4 py-3" scope="col">Chief Complaint</th>
                      <th className="text-left px-4 py-3" scope="col">Doctor</th>
                      <th className="text-left px-4 py-3" scope="col">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {enrichedVisits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/doctor/visits/${visit.id}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {(visit.patient as any)?.name || "Unknown"}
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
                          {(visit.doctor as any)?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/consultations"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
