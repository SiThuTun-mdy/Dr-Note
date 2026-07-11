# Authentication & Authorization Specification

**Document ID**: 07  
**Version**: 1.0  
**Status**: Draft  
**Created**: 2026-07-11  
**Author**: Security Architecture  

---

## 1. Overview

This document defines the authentication and authorization architecture for Dr-Note, a healthcare application managing patient records, consultations, and prescriptions. The system handles Protected Health Information (PHI) and must comply with healthcare security standards.

### 1.1 Security Principles

| Principle | Description |
|-----------|-------------|
| **Least Privilege** | Users receive minimum permissions needed for their role |
| **Defense in Depth** | Multiple security layers protect against bypass |
| **Zero Trust** | Every request is verified, regardless of origin |
| **Separation of Duties** | Critical operations require multiple roles |

---

## 2. Authentication Architecture

### 2.1 Identity Provider

**Provider**: Supabase Auth (Built on GoTrue)

| Feature | Implementation |
|---------|----------------|
| Password Storage | bcrypt (Supabase default) |
| Token Type | JWT (HS256 signed) |
| Session Storage | HTTP-only cookies |
| MFA Support | Planned (Phase 2) |

### 2.2 Authentication Flow

#### 2.2.1 Registration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Supabase  │────▶│  Database   │────▶│   Email     │
│  (Browser)  │     │    Auth     │     │   (RLS)     │     │  Service    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │ 1. Submit         │                   │                   │
       │   Registration    │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │ 2. Create         │                   │
       │                   │   auth.users      │                   │
       │                   │──────────────────▶│                   │
       │                   │                   │ 3. Trigger        │
       │                   │                   │   handle_new_user │
       │                   │                   │──────────────────▶│
       │                   │                   │ 4. Create         │
       │                   │                   │   public.users    │
       │                   │◀──────────────────│                   │
       │ 5. Return         │                   │                   │
       │   session         │                   │                   │
       │◀──────────────────│                   │                   │
       │                   │ 6. Send            │                   │
       │                   │   confirmation    │                   │
       │                   │──────────────────────────────────────▶│
```

**Server Action**:
```typescript
// src/app/auth/register/actions.ts
"use server"

import { createClient } from '@/lib/supabase/server'
import { UserRegistrationSchema } from '@/lib/validations/user'
import { auditLog, AuditActions } from '@/lib/audit'

export async function registerUser(data: unknown) {
  // 1. Validate input
  const validated = UserRegistrationSchema.parse(data)
  
  // 2. Create Supabase auth user
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        full_name: `${validated.first_name} ${validated.last_name}`,
        role: validated.role,
      }
    }
  })
  
  if (error) throw error
  
  // 3. Audit log
  await auditLog(
    AuditActions.USER_CREATE,
    'user',
    authData.user?.id || '',
    { email: validated.email, role: validated.role }
  )
  
  return { success: true }
}
```

#### 2.2.2 Login Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Middleware │────▶│   Supabase  │
│  (Browser)  │     │   (Next.js) │     │    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │ 1. POST           │                   │
       │   /auth/login     │                   │
       │──────────────────▶│                   │
       │                   │ 2. Validate       │
       │                   │   credentials     │
       │                   │──────────────────▶│
       │                   │ 3. Return         │
       │                   │   JWT + cookies   │
       │                   │◀──────────────────│
       │ 4. Set-Cookie     │                   │
       │◀──────────────────│                   │
       │                   │                   │
       │ 5. GET /dashboard │                   │
       │──────────────────▶│                   │
       │                   │ 6. Validate       │
       │                   │   JWT from cookie │
       │                   │──────────────────▶│
       │ 7. Allow/Redirect │                   │
       │◀──────────────────│                   │
```

**Login Server Action**:
```typescript
// src/app/auth/login/actions.ts
"use server"

import { createClient } from '@/lib/supabase/server'
import { UserLoginSchema } from '@/lib/validations/user'
import { auditLog, AuditActions } from '@/lib/audit'

export async function loginUser(data: unknown) {
  const validated = UserLoginSchema.parse(data)
  
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  })
  
  if (error) {
    await auditLog(
      AuditActions.USER_LOGIN,
      'user',
      '',
      { email: validated.email, success: false, error: error.message }
    )
    throw error
  }
  
  await auditLog(
    AuditActions.USER_LOGIN,
    'user',
    authData.user.id,
    { email: validated.email, success: true }
  )
  
  return { success: true }
}
```

#### 2.2.3 Logout Flow

```typescript
// src/app/auth/logout/actions.ts
"use server"

import { createClient } from '@/lib/supabase/server'
import { auditLog, AuditActions } from '@/lib/audit'

export async function logoutUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await auditLog(AuditActions.USER_LOGOUT, 'user', user.id)
  }
  
  await supabase.auth.signOut()
  
  return { success: true }
}
```

### 2.3 Session Management

#### 2.3.1 Cookie Configuration

```typescript
// Supabase cookie settings (managed by @supabase/ssr)
{
  name: 'sb-',                    // Prefix
  lifetime: 60 * 60 * 24 * 7,    // 7 days
  domain: process.env.COOKIE_DOMAIN,
  path: '/',
  sameSite: 'lax',               // CSRF protection
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,                 // No JavaScript access
}
```

#### 2.3.2 Session Refresh Strategy

```typescript
// Middleware refreshes session on every request
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(/* ... */)
  
  // Refresh session - extends expiry
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect unauthenticated users
  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return supabaseResponse
}
```

#### 2.3.3 Session Timeout

| Environment | Idle Timeout | Absolute Timeout |
|-------------|--------------|------------------|
| Development | 24 hours | 7 days |
| Production | 30 minutes | 24 hours |

### 2.4 Token Structure

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "uuid-of-user",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "full_name": "Dr. Smith",
    "role": "doctor"
  }
}
```

**Important**: The `role` claim in JWT is always `authenticated`. Application role is in `user_metadata.role`.

---

## 3. Authorization Architecture

### 3.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                  │
│  • Full system access                                           │
│  • User management                                              │
│  • System configuration                                         │
│  • View all audit logs                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│      DOCTOR       │ │       NURSE       │ │   RECEPTIONIST    │
│ • Patient records │ │ • Patient records │ │ • Patient records │
│ • Consultations   │ │ • View consultations│ │ • Create patients│
│ • Prescriptions   │ │ • Limited updates │ │ • Schedule only   │
│ • Own data only   │ │ • All patients    │ │ • All patients    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

### 3.2 Role Definitions

| Role | Description | Default |
|------|-------------|---------|
| `admin` | System administrator with full access | No |
| `doctor` | Medical professional, manages consultations | No |
| `nurse` | Clinical staff, limited write access | No |
| `receptionist` | Front desk, patient registration only | Yes |

### 3.3 Permission Matrix

#### 3.3.1 Users Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT (own) | ✅ | ✅ | ✅ | ✅ |
| SELECT (others) | ✅ | ❌ | ❌ | ❌ |
| INSERT | ✅ (any) | ❌ | ❌ | ❌ |
| UPDATE (own) | ✅ | ✅ | ✅ | ✅ |
| UPDATE (others) | ✅ | ❌ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ | ❌ |

#### 3.3.2 Patients Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT | ✅ | ✅ | ✅ | ✅ |
| INSERT | ✅ | ❌ | ❌ | ✅ |
| UPDATE | ✅ | ⚠️ Own patients | ✅ | ✅ |
| DELETE | ✅ | ❌ | ❌ | ❌ |

#### 3.3.3 Consultations Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT | ✅ | ✅ Own | ✅ All | ✅ All |
| INSERT | ✅ | ✅ Own | ❌ | ❌ |
| UPDATE | ✅ | ✅ Own | ⚠️ Limited | ❌ |
| DELETE | ✅ | ❌ | ❌ | ❌ |

### 3.4 RLS Policies Implementation

```sql
-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY users_select_admin ON users
  FOR SELECT USING (is_admin());

-- Only admins can create users
CREATE POLICY users_insert_admin ON users
  FOR INSERT WITH CHECK (is_admin());

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any user
CREATE POLICY users_update_admin ON users
  FOR UPDATE USING (is_admin());

-- Only admins can delete users
CREATE POLICY users_delete_admin ON users
  FOR DELETE USING (is_admin());

-- ============================================
-- PATIENTS TABLE POLICIES
-- ============================================

-- All authenticated users can view patients
CREATE POLICY patients_select_authenticated ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Receptionists and admins can create patients
CREATE POLICY patients_insert_receptionist ON patients
  FOR INSERT WITH CHECK (is_receptionist() OR is_admin());

-- Receptionists, nurses, and admins can update patients
CREATE POLICY patients_update_receptionist ON patients
  FOR UPDATE USING (
    is_receptionist() OR 
    is_admin() OR
    is_nurse()
  );

-- Only admins can delete patients
CREATE POLICY patients_delete_admin ON patients
  FOR DELETE USING (is_admin());

-- ============================================
-- CONSULTATIONS TABLE POLICIES
-- ============================================

-- Doctors see own, others see all
CREATE POLICY consultations_select_doctor_own ON consultations
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    OR is_admin()
    OR is_receptionist()
    OR is_nurse()
  );

-- Doctors and admins can create
CREATE POLICY consultations_insert_doctor ON consultations
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Doctors own, admins all
CREATE POLICY consultations_update_doctor_own ON consultations
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Only admins can delete
CREATE POLICY consultations_delete_admin ON consultations
  FOR DELETE USING (is_admin());
```

---

## 4. Server-Side Authorization

### 4.1 Security Helper Functions

```typescript
// src/lib/security.ts

/**
 * Require authenticated user
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized: Please log in')
  }
  
  return user
}

/**
 * Require specific role(s)
 * @throws Error if user lacks required role
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<{
  user: User;
  profile: UserProfile
}> {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    throw new Error('Unauthorized: User profile not found')
  }
  
  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new Error(`Unauthorized: Required role: ${allowedRoles.join(' or ')}`)
  }
  
  return { user, profile }
}

/**
 * Check patient access (doctor-specific)
 */
export async function canAccessPatient(patientId: string): Promise<boolean> {
  const { user, profile } = await requireRole(['admin', 'doctor', 'nurse', 'receptionist'])
  
  // Admin, nurse, receptionist: full access
  if (profile.role !== 'doctor') return true
  
  // Doctor: only assigned patients
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('consultations')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', user.id)
    .limit(1)
  
  return !error && data && data.length > 0
}
```

### 4.2 Server Action Pattern

```typescript
// src/app/(dashboard)/patients/[id]/actions.ts
"use server"

import { requireAuth, requireRole, canAccessPatient } from '@/lib/security'
import { PatientSchema } from '@/lib/validations/patient'
import { auditLog, AuditActions } from '@/lib/audit'
import { createClient } from '@/lib/supabase/server'

export async function updatePatient(id: string, data: unknown) {
  // 1. Authentication
  const { user, profile } = await requireRole(['admin', 'doctor', 'nurse', 'receptionist'])
  
  // 2. Authorization (role + ownership)
  const hasAccess = await canAccessPatient(id)
  if (!hasAccess) {
    throw new Error('Insufficient permissions: Cannot access this patient')
  }
  
  // 3. Input validation
  const validated = PatientSchema.partial().parse(data)
  
  // 4. Database operation (RLS enforced)
  const supabase = await createClient()
  const { error } = await supabase
    .from('patients')
    .update(validated)
    .eq('id', id)
  
  if (error) throw error
  
  // 5. Audit log
  await auditLog(
    AuditActions.PATIENT_UPDATE,
    'patient',
    id,
    { changes: validated, user_role: profile.role }
  )
  
  return { success: true }
}
```

---

## 5. Client-Side Authorization

### 5.1 Route Protection (Middleware)

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']
const ADMIN_ROUTES = ['/admin', '/admin/users', '/admin/settings']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Additional client-side checks can be added here
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 5.2 Component-Level Guards

```typescript
// src/components/auth/RoleGuard.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export async function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback 
}: RoleGuardProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    return fallback || <AccessDenied />
  }
  
  return <>{children}</>
}

// Usage in page
export default async function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboard />
    </RoleGuard>
  )
}
```

### 5.3 Client-Side Role Context

```typescript
// src/contexts/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist'
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  hasRole: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
      
      setLoading(false)
    }
    
    getSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        // Refresh profile on auth change
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const hasRole = (roles: string[]) => {
    return profile ? roles.includes(profile.role) : false
  }
  
  return (
    <AuthContext.Provider value={{ user, profile, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## 6. API Route Protection

### 6.1 Protected API Routes

```typescript
// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/security'
import { PatientSchema } from '@/lib/validations/patient'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    await requireRole(['admin', 'doctor', 'nurse', 'receptionist'])
    
    // 2. Get database client (RLS enforced)
    const supabase = await createClient()
    
    // 3. Query with RLS
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate & authorize
    await requireRole(['admin', 'receptionist'])
    
    // 2. Validate input
    const body = await request.json()
    const validated = PatientSchema.parse(body)
    
    // 3. Insert (RLS enforced)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('patients')
      .insert(validated)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 7. Security Controls

### 7.1 Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10 requests per 10 seconds
  analytics: true,
})

// Usage in middleware
export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining } = await ratelimit.limit(identifier)
  
  if (!success) {
    throw new Error('Rate limit exceeded')
  }
  
  return { limit, remaining }
}
```

### 7.2 CSRF Protection

```typescript
// Middleware ensures SameSite cookies
// Additional CSRF token for forms:

import { cookies } from 'next/headers'
import { createHmac, randomBytes } from 'crypto'

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  const signature = createHmac('sha256', process.env.CSRF_SECRET!)
    .update(token)
    .digest('hex')
  return `${token}.${signature}`
}

export function validateCsrfToken(token: string): boolean {
  const [tokenPart, signature] = token.split('.')
  const expectedSignature = createHmac('sha256', process.env.CSRF_SECRET!)
    .update(tokenPart)
    .digest('hex')
  return signature === expectedSignature
}
```

### 7.3 Security Headers

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  },
]

const nextConfig: NextConfig = {
  headers: async () => securityHeaders,
}

export default nextConfig
```

---

## 8. Audit Logging

### 8.1 Required Audit Events

| Category | Events |
|----------|--------|
| **Authentication** | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGE, PASSWORD_RESET |
| **User Management** | USER_CREATE, USER_UPDATE, USER_DELETE, ROLE_CHANGE |
| **Patient Data** | PATIENT_CREATE, PATIENT_UPDATE, PATIENT_DELETE, PATIENT_VIEW |
| **Consultations** | CONSULTATION_CREATE, CONSULTATION_UPDATE, CONSULTATION_DELETE |
| **System** | SETTINGS_UPDATE, EXPORT_DATA, BACKUP_RESTORE |

### 8.2 Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, unknown>
  ip_address: string
  user_agent: string
  created_at: Date
}
```

### 8.3 Implementation

```typescript
// Already implemented in src/lib/audit.ts
export async function auditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  // ... implementation
}
```

---

## 9. Emergency Access (Break Glass)

### 9.1 Procedure

1. Admin can enable "Emergency Mode" in system settings
2. Emergency mode bypasses normal authorization checks
3. All emergency access is logged with HIGH priority
4. Emergency mode auto-disables after 1 hour
5. Requires admin approval to extend

### 9.2 Implementation

```typescript
// src/lib/emergency.ts
export async function checkEmergencyAccess(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'emergency_mode')
    .single()
  
  if (data?.value === 'enabled') {
    await auditLog('emergency.access', 'system', userId, {
      warning: 'Emergency access granted'
    })
    return true
  }
  
  return false
}
```

---

## 10. Testing Requirements

### 10.1 Test Cases

| Test ID | Description | Priority |
|---------|-------------|----------|
| AUTH-001 | Unauthenticated user redirected to login | High |
| AUTH-002 | Invalid credentials rejected | High |
| AUTH-003 | Session expires after timeout | Medium |
| AUTH-004 | Role-based access enforced | High |
| AUTH-005 | Cross-user data access denied | Critical |
| AUTH-006 | Admin-only routes protected | High |
| AUTH-007 | CSRF token validated | Medium |
| AUTH-008 | Rate limiting enforced | Medium |
| AUTH-009 | Audit logs created for all actions | High |
| AUTH-010 | Emergency access logged | Medium |

### 10.2 Test Implementation

```typescript
// tests/auth/security.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Security', () => {
  test('AUTH-001: Unauthenticated user redirected', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
  
  test('AUTH-002: Invalid credentials rejected', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('.error-message')).toBeVisible()
  })
  
  test('AUTH-005: Doctor cannot access other doctor patients', async ({ browser }) => {
    // Login as doctor1
    const doctor1Context = await browser.newContext()
    const doctor1Page = await doctor1Context.newPage()
    // ... login logic
    
    // Try to access doctor2's patient
    const response = await doctor1Page.request.get('/api/patients/other-doctor-patient-id')
    expect(response.status()).toBe(403)
  })
})
```

---

## 11. Compliance Requirements

### 11.1 HIPAA Technical Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Access Control | ✅ RLS + Role-based authorization |
| Audit Controls | ✅ Comprehensive audit logging |
| Integrity | ✅ JWT signing, input validation |
| Transmission Security | ✅ HTTPS, secure cookies |
| Authentication | ✅ Strong passwords, session management |

### 11.2 Data Classification

| Level | Data Examples | Access |
|-------|---------------|--------|
| **PHI** | Patient names, medical history, diagnoses | Doctor, Nurse (assigned), Admin |
| **PII** | Emails, phone numbers, addresses | All authenticated users |
| **System** | Audit logs, settings | Admin only |
| **Public** | Login page, public info | Anonymous |

---

## 12. Future Enhancements

| Phase | Feature | Priority |
|-------|---------|----------|
| Phase 2 | Multi-Factor Authentication (MFA) | High |
| Phase 2 | OAuth providers (Google, Microsoft) | Medium |
| Phase 3 | API key management | Medium |
| Phase 3 | IP whitelisting | Low |
| Phase 4 | Biometric authentication | Low |
| Phase 4 | Hardware security keys (WebAuthn) | Low |

---

## Appendix A: Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for enhanced security)
CSRF_SECRET=your-csrf-secret-min-32-chars
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

---

## Appendix B: Database Functions

```sql
-- Role checking functions (already implemented)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_doctor() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor');
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_nurse() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'nurse');
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_receptionist() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'receptionist');
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

---

**Document End**
