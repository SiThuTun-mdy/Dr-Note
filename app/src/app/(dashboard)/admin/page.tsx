import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, Calendar, Settings, FileText, Shield, BarChart3, ClipboardList } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Stats cards — design system §4: admin → user management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total patients</p>
                <p className="text-3xl font-semibold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s visits</p>
                <p className="text-3xl font-semibold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active staff</p>
                <p className="text-3xl font-semibold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-semibold text-foreground mt-1">—</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions — Bento Grid style, design system §4 */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users" className="group">
            <div className="h-full p-5 bg-card rounded-2xl border border-border shadow-sm
              hover:shadow-md hover:border-primary/30 hover:scale-[1.02]
              transition-all duration-200 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Manage users</h3>
              <p className="text-xs text-muted-foreground">Add, edit, or deactivate staff accounts</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="group">
            <div className="h-full p-5 bg-card rounded-2xl border border-border shadow-sm
              hover:shadow-md hover:border-primary/30 hover:scale-[1.02]
              transition-all duration-200 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">View reports</h3>
              <p className="text-xs text-muted-foreground">Analytics and clinic performance</p>
            </div>
          </Link>

          <Link href="/admin/audit" className="group">
            <div className="h-full p-5 bg-card rounded-2xl border border-border shadow-sm
              hover:shadow-md hover:border-primary/30 hover:scale-[1.02]
              transition-all duration-200 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Audit log</h3>
              <p className="text-xs text-muted-foreground">Track system activity and changes</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="group">
            <div className="h-full p-5 bg-card rounded-2xl border border-border shadow-sm
              hover:shadow-md hover:border-primary/30 hover:scale-[1.02]
              transition-all duration-200 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                group-hover:bg-primary/20 transition-colors">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Settings</h3>
              <p className="text-xs text-muted-foreground">System configuration and preferences</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System overview — design system §3 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Database status</span>
              <span className="text-sm font-medium text-green-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Auth provider</span>
              <span className="text-sm font-medium text-foreground">Supabase</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
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
  )
}
