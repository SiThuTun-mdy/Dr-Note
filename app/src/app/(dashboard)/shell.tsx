"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userRole: string
  dashboardUrl: string
}

// Page titles by path — design system §8: sentence case
const getPageTitle = (pathname: string): string => {
  if (pathname.includes("/admin/users")) return "User management"
  if (pathname.includes("/admin/settings")) return "Settings"
  if (pathname.includes("/admin/reports")) return "Reports"
  if (pathname.includes("/admin/audit")) return "Audit log"
  if (pathname.includes("/admin")) return "Admin dashboard"
  if (pathname.includes("/doctor")) return "Doctor dashboard"
  if (pathname.includes("/nurse")) return "Nurse dashboard"
  if (pathname.includes("/reception")) return "Reception dashboard"
  return "Dashboard"
}

export function DashboardShell({
  children,
  userName,
  userRole,
  dashboardUrl,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="flex h-screen bg-background">
      {/* Skip link for accessibility — design system §7 */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar — design system §4 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — design system §4 */}
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
          userName={userName}
          userRole={userRole}
        />

        {/* Page Content — design system §4: max-w-6xl, p-6 */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          role="main"
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
