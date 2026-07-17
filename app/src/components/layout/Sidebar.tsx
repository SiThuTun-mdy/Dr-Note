"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
  UserPlus,
  Activity,
  X,
  Clock,
  History,
  User,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

// Navigation items based on user role — design system §4
const navigationByRole: Record<
  string,
  { name: string; href: string; icon: React.ReactNode }[]
> = {
  receptionist: [
    {
      name: "Dashboard",
      href: "/reception",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Register patient",
      href: "/reception/patients/new",
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      name: "New visit",
      href: "/reception/visits/new",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Today's queue",
      href: "/queue",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "Patients",
      href: "/patients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "My profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ],
  nurse: [
    {
      name: "Dashboard",
      href: "/nurse",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Screening queue",
      href: "/screening",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      name: "Patients",
      href: "/patients",
      icon: <Users className="h-5 w-5" />,
    },
    // {
    //   name: "Vitals",
    //   href: "/vitals",
    //   icon: <Stethoscope className="h-5 w-5" />,
    // },
    // { name: "Notes", href: "/notes", icon: <FileText className="h-5 w-5" /> },
    {
      name: "My profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ],
  doctor: [
    {
      name: "Dashboard",
      href: "/doctor",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Patients",
      href: "/patients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Consultations",
      href: "/consultations",
      icon: <Stethoscope className="h-5 w-5" />,
    },
    {
      name: "My profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ],
  admin: [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    // { name: "Patients", href: "/patients", icon: <User className="h-5 w-5" /> },
    // { name: "Waiting", href: "/waiting", icon: <Clock className="h-5 w-5" /> },
    // { name: "Consultation", href: "/consultation", icon: <Stethoscope className="h-5 w-5" /> },
    // { name: "History", href: "/history", icon: <History className="h-5 w-5" /> },
    {
      name: "User management",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Add staff",
      href: "/admin/staff/new",
      icon: <UserPlus className="h-5 w-5" />,
    },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: <Settings className="h-5 w-5" />,
    // },
    // {
    //   name: "Reports",
    //   href: "/admin/reports",
    //   icon: <FileText className="h-5 w-5" />,
    // },
    // {
    //   name: "Audit log",
    //   href: "/admin/audit",
    //   icon: <Activity className="h-5 w-5" />,
    // },
    {
      name: "My profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ],
  // Patients only see their own record page — no staff navigation.
  patient: [],
};

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navigation =
    navigationByRole[userRole] || navigationByRole.receptionist;

  const roleDashboard: Record<string, string> = {
    admin: "/admin",
    doctor: "/doctor",
    nurse: "/nurse",
    receptionist: "/reception",
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — design system §4: w-60, nav per role */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo — clickable link to dashboard */}
        <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
          <Link
            href={roleDashboard[userRole] || "/admin"}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">
              Dr.Note
            </span>
          </Link>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded hover:bg-sidebar-accent"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation — design system §4: icon + label, active item bg-muted text-primary */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150 min-h-[44px]
                  ${
                    isActive
                      ? "bg-muted text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
              transition-colors duration-150 w-full min-h-[44px]"
            onClick={async () => {
              const { logout } = await import("@/app/(auth)/login/actions");
              await logout();
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
