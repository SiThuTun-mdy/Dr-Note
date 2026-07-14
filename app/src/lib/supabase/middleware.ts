import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Role → default dashboard mapping
const roleDashboard: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor',
  nurse: '/nurse',
  receptionist: '/reception',
}

// Patients have no shared dashboard; their landing page is their own record.
function dashboardFor(roleName: string | undefined, userId: string): string {
  if (roleName === 'patient') return `/patients/${userId}`
  return roleDashboard[roleName || ''] || '/login'
}

// Allowed route prefixes per role
const roleRoutes: Record<string, string[]> = {
  admin: ['/admin', '/queue', '/patients', '/history', '/api'],
  doctor: ['/doctor', '/queue', '/patients', '/my-queue', '/consultation', '/consultations', '/prescriptions', '/history', '/api'],
  nurse: ['/nurse', '/queue', '/patients', '/screening', '/vitals', '/notes', '/api'],
  receptionist: ['/reception', '/queue', '/patients', '/appointments', '/history', '/api'],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public paths that don't require auth. `/set-password` is reached right
  // after /auth/confirm establishes a session for a role (patient) that has
  // no dashboard yet — it must bypass the role-route allowlist below, same
  // as /auth/* itself. The page's own server action still requires a valid
  // session before it will change anything.
  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/set-password') ||
    pathname === '/'

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // For authenticated users, fetch role once and reuse
  if (user) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .limit(1)

    const roleName = (roles?.[0] as unknown as { roles: { name: string } | null })?.roles?.name

    // Redirect authenticated users away from login/home to their dashboard.
    // Guard against self-redirect: a user with no resolvable dashboard
    // (e.g. no role yet) must be allowed to stay on /login rather than
    // being redirected to /login in an infinite loop.
    if (pathname === '/login' || pathname === '/') {
      const dashboard = dashboardFor(roleName, user.id)
      if (dashboard !== pathname) {
        const url = request.nextUrl.clone()
        url.pathname = dashboard
        return NextResponse.redirect(url)
      }
    }

    // Role-based route protection for protected routes
    if (!isPublicPath && roleName) {
      const allowedPrefixes = roleRoutes[roleName] || []

      // Special-case: patients may only access their own patient path
      let isAllowed = false
      if (roleName === 'patient' && user) {
        const patientPrefix = `/patients/${user.id}`
        isAllowed = pathname === patientPrefix || pathname.startsWith(patientPrefix + '/')
      }

      // Fallback to prefix-based checks for other roles (or additional allowed prefixes)
      if (!isAllowed) {
        isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
      }

      // If user tries to access another role's route, redirect to own dashboard
      if (!isAllowed) {
        const url = request.nextUrl.clone()
        url.pathname = dashboardFor(roleName, user.id)
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
