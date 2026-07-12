"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Search, MoreHorizontal, UserPlus, UserMinus } from "lucide-react"
import {
  getUsers,
  getRoles,
  assignRole,
  removeRole,
  toggleUserActive,
  type UserWithRoles,
  type Role,
} from "./actions"

const roleBadgeColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  doctor: "bg-blue-100 text-blue-800",
  nurse: "bg-green-100 text-green-800",
  receptionist: "bg-purple-100 text-purple-800",
  patient: "bg-gray-100 text-gray-800",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    userName: string
    isActive: boolean
  }>({ open: false, userId: "", userName: "", isActive: true })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [usersResult, rolesResult] = await Promise.all([getUsers(), getRoles()])
    if (usersResult.data) setUsers(usersResult.data)
    if (rolesResult.data) setRoles(rolesResult.data)
    if (usersResult.error) toast.error(usersResult.error)
    setLoading(false)
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAssignRole(userId: string, roleId: number) {
    const result = await assignRole(userId, roleId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Role assigned")
      await loadData()
    }
  }

  async function handleRemoveRole(userId: string, roleId: number) {
    const result = await removeRole(userId, roleId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Role removed")
      await loadData()
    }
  }

  async function handleToggleActive() {
    const result = await toggleUserActive(confirmDialog.userId, confirmDialog.isActive)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(confirmDialog.isActive ? "User activated" : "User deactivated")
      await loadData()
    }
    setConfirmDialog({ open: false, userId: "", userName: "", isActive: true })
  }

  function getUserRoles(userId: string) {
    const user = users.find((u) => u.id === userId)
    return user?.roles || []
  }

  function getAvailableRoles(userId: string) {
    const userRoles = getUserRoles(userId)
    const userRoleIds = new Set(userRoles.map((r) => r.id))
    return roles.filter((r) => !userRoleIds.has(r.id))
  }

  if (loading) {
    return (
      <>
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Roles</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Active</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              className={`${roleBadgeColors[role.name] || "bg-gray-100 text-gray-800"} text-xs`}
                            >
                              {role.name}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.id)}
                                className="ml-1 hover:text-red-600"
                                aria-label={`Remove ${role.name} role`}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(checked) =>
                              setConfirmDialog({
                                open: true,
                                userId: user.id,
                                userName: user.name,
                                isActive: !checked,
                              })
                            }
                            aria-label={`Toggle ${user.name} active status`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getAvailableRoles(user.id).length > 0 && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Assign role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {getAvailableRoles(user.id).map((role) => (
                                    <DropdownMenuItem
                                      key={role.id}
                                      onClick={() => handleAssignRole(user.id, role.id)}
                                    >
                                      {role.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}
                            {user.roles.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {user.roles.map((role) => (
                                  <DropdownMenuItem
                                    key={role.id}
                                    onClick={() => handleRemoveRole(user.id, role.id)}
                                    className="text-red-600"
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove {role.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.isActive ? "Deactivate user?" : "Activate user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.isActive
                ? `${confirmDialog.userName} will not be able to log in.`
                : `${confirmDialog.userName} will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              className={confirmDialog.isActive ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {confirmDialog.isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
