import type { createClient } from "@/lib/supabase/server"

type ServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * Whether the user holds the given role. Checks all of the user's roles —
 * a user can hold more than one (01-database-schema.md §4).
 */
export async function userHasRole(
  supabase: ServerClient,
  userId: string,
  roleName: string
): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)

  return (
    data?.some(
      (row) =>
        (row as unknown as { roles: { name: string } | null }).roles?.name ===
        roleName
    ) ?? false
  )
}
