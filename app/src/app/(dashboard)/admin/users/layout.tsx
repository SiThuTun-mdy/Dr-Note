import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage system users, roles, and access",
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
