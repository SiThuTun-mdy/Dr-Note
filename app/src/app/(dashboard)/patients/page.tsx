import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

export default async function PatientsPage({
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
    .from("patient_profiles")
    .select("user_id", { count: "exact", head: true });

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  // Fetch paginated patient profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("patient_profiles")
    .select("user_id, nrc, dob, gender")
    .range(offset, offset + PAGE_SIZE - 1);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Fetch user data for these patients
  const userIds = profiles?.map(p => p.user_id) || [];
  const { data: users } = userIds.length > 0
    ? await supabase.from("users").select("id, name, email, is_active").in("id", userIds)
    : { data: [] };

  const userMap = new Map(users?.map(u => [u.id, u]) || []);
  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  // Combine data
  const patients = (profiles || []).map(p => ({
    ...p,
    user: userMap.get(p.user_id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Manage patient records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All patients</CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patients found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="emr-table-header">
                      <th className="text-left px-4 py-3" scope="col">Name</th>
                      <th className="text-left px-4 py-3" scope="col">Email</th>
                      <th className="text-left px-4 py-3" scope="col">NRC</th>
                      <th className="text-left px-4 py-3" scope="col">DOB</th>
                      <th className="text-left px-4 py-3" scope="col">Gender</th>
                      <th className="text-left px-4 py-3" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {patients.map((patient) => (
                      <tr key={patient.user_id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">
                          {patient.user?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {patient.user?.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {patient.nrc || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {patient.dob ? new Date(patient.dob).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {patient.gender || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            patient.user?.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {patient.user?.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/patients"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
