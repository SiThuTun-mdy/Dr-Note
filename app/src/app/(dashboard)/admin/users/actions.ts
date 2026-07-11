"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface UserWithRoles {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  roles: { id: number; name: string }[]
}

export interface Role {
  id: number
  name: string
}

// Fetch all users with their roles
export async function getUsers(): Promise<{ data: UserWithRoles[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  // Check admin role
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)

  const roleName = (userRoles?.[0] as unknown as { roles: { name: string } | null })?.roles?.name
  if (roleName !== "admin") return { data: null, error: "Unauthorized" }

  // Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name, email, is_active, created_at")
    .order("created_at", { ascending: false })

  if (usersError) return { data: null, error: "Failed to fetch users" }

  // Fetch all roles for each user
  const { data: allUserRoles } = await supabase
    .from("user_roles")
    .select("user_id, roles(id, name)")

  // Group roles by user
  const rolesByUser = new Map<string, { id: number; name: string }[]>()
  for (const ur of allUserRoles || []) {
    const roles = rolesByUser.get(ur.user_id) || []
    const role = (ur as unknown as { roles: { id: number; name: string } | null }).roles
    if (role) roles.push(role)
    rolesByUser.set(ur.user_id, roles)
  }

  const result: UserWithRoles[] = (users || []).map((u) => ({
    ...u,
    roles: rolesByUser.get(u.id) || [],
  }))

  return { data: result, error: null }
}

// Fetch all available roles
export async function getRoles(): Promise<{ data: Role[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("id")

  if (error) return { data: null, error: "Failed to fetch roles" }
  return { data, error: null }
}

// Assign a role to a user
export async function assignRole(
  userId: string,
  roleId: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleId })

  if (error) {
    if (error.code === "23505") return { success: false, error: "User already has this role" }
    return { success: false, error: "Failed to assign role" }
  }

  revalidatePath("/admin/users")
  return { success: true, error: null }
}

// Remove a role from a user
export async function removeRole(
  userId: string,
  roleId: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId)

  if (error) return { success: false, error: "Failed to remove role" }

  revalidatePath("/admin/users")
  return { success: true, error: null }
}

// Toggle user active status
export async function toggleUserActive(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // Prevent admin from deactivating themselves
  if (user.id === userId && !isActive) {
    return { success: false, error: "You cannot deactivate your own account" }
  }

  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId)

  if (error) return { success: false, error: "Failed to update user status" }

  revalidatePath("/admin/users")
  return { success: true, error: null }
}
