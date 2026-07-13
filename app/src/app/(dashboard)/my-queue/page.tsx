import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

interface EnrichedVisit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_type: string | null;
  status: "waiting" | "screening" | "with_doctor" | "completed";
  chief_complaint: string | null;
  visit_date: string;
  patient?: { name: string; email: string } | null;
}

export default async function MyQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Get total count for this doctor
  const { count } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", user?.id || "");

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  // Fetch paginated visits for this doctor
  const { data: visits, error } = await supabase
    .from("visits")
    .select("*")
    .eq("doctor_id", user?.id || "")
    .order("visit_date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1) as { data: EnrichedVisit[] | null; error: Error | null };

  if (error) {
    console.error("Error fetching my queue:", error);
  }

  // Enrich with patient names
  const enrichedVisits = await Promise.all(
    (visits || []).map(async (visit) => {
      const { data: patient } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", visit.patient_id)
        .single();

      return { ...visit, patient };
    })
  );

  // Separate by status
  const activeVisits = enrichedVisits.filter(v => ["waiting", "screening", "with_doctor"].includes(v.status));
  const completedVisits = enrichedVisits.filter(v => v.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">My Queue</h1>
        <p className="text-muted-foreground">Your assigned patient visits</p>
      </div>

      {/* Active visits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active visits</CardTitle>
        </CardHeader>
        <CardContent>
          {activeVisits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active visits assigned to you
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="emr-table-header">
                    <th className="text-left px-4 py-3" scope="col">Patient</th>
                    <th className="text-left px-4 py-3" scope="col">Type</th>
                    <th className="text-left px-4 py-3" scope="col">Status</th>
                    <th className="text-left px-4 py-3" scope="col">Chief Complaint</th>
                    <th className="text-left px-4 py-3" scope="col">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctor/visits/${visit.id}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {visit.patient?.name || "Unknown"}
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
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed visits */}
      {completedVisits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Completed today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="emr-table-header">
                    <th className="text-left px-4 py-3" scope="col">Patient</th>
                    <th className="text-left px-4 py-3" scope="col">Type</th>
                    <th className="text-left px-4 py-3" scope="col">Chief Complaint</th>
                    <th className="text-left px-4 py-3" scope="col">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {completedVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctor/visits/${visit.id}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {visit.patient?.name || "Unknown"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                        {visit.visit_type || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                        {visit.chief_complaint || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/my-queue"
      />
    </div>
  );
}
