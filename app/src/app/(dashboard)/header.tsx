"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LogOut, Users } from "lucide-react"
import { logout } from "../(auth)/login/actions"

interface DashboardHeaderProps {
  userName: string
  roleName: string
  dashboardUrl: string
}

const roleColors: Record<string, string> = {
  admin: "bg-red-500",
  doctor: "bg-blue-500",
  nurse: "bg-green-500",
  receptionist: "bg-purple-500",
  patient: "bg-gray-500",
}

const roleInitials: Record<string, string> = {
  admin: "AD",
  doctor: "DR",
  nurse: "NU",
  receptionist: "RE",
  patient: "PA",
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: "User Management",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    roles: ["admin"],
  },
]

export default function DashboardHeader({
  userName,
  roleName,
  dashboardUrl,
}: DashboardHeaderProps) {
  const pathname = usePathname()

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(roleName)
  )

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href={dashboardUrl} className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">Dr.Note</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: User menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full ${roleColors[roleName] || 'bg-gray-500'} flex items-center justify-center`}>
                <span className="text-xs font-semibold text-white">
                  {roleInitials[roleName] || roleName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">{userName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{roleName}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
