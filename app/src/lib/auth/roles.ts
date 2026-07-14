import type { createClient } from "@/lib/supabase/server"

type ServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * All role names held by the user — a user can hold more than one
 * (01-database-schema.md §4). Fetches once so callers can check membership
 * in-memory instead of round-tripping per role.
 */
export async function getUserRoles(
  supabase: ServerClient,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)

  return (
    data
      ?.map((row) => (row as unknown as { roles: { name: string } | null }).roles?.name)
      .filter((name): name is string => !!name) ?? []
  )
}

/**
 * Whether the user holds the given role. Checks all of the user's roles —
 * a user can hold more than one (01-database-schema.md §4).
 */
export async function userHasRole(
  supabase: ServerClient,
  userId: string,
  roleName: string
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId)
  return roles.includes(roleName)
}
