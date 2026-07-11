import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Activity, Calendar, ArrowRight, Settings, FileText } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, Admin</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your clinic today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Visits</p>
                <p className="text-3xl font-bold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-3xl font-bold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">User Management</p>
                    <p className="text-sm text-muted-foreground">Manage staff accounts and roles</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 opacity-50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">System Settings</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <span className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Auth Provider</span>
                <span className="text-sm font-medium text-foreground">Supabase</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Hosting</span>
                <span className="text-sm font-medium text-foreground">Vercel</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="text-sm font-medium text-primary">Development</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
