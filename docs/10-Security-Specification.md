# Dr-Note Security Specification

**Document ID**: 10  
**Version**: 1.0  
**Status**: Active  
**Created**: 2026-07-11  
**Classification**: Internal  
**Review Cycle**: Quarterly  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security Architecture](#2-security-architecture)
3. [Authentication](#3-authentication)
4. [Authorization](#4-authorization)
5. [Session Management](#5-session-management)
6. [Data Protection](#6-data-protection)
7. [API Security](#7-api-security)
8. [Input Validation & Sanitization](#8-input-validation--sanitization)
9. [Rate Limiting](#9-rate-limiting)
10. [Security Headers & CSP](#10-security-headers--csp)
11. [Audit Logging](#11-audit-logging)
12. [Error Handling](#12-error-handling)
13. [Infrastructure Security](#13-infrastructure-security)
14. [Dependency Security](#14-dependency-security)
15. [HIPAA Compliance](#15-hipaa-compliance)
16. [Incident Response](#16-incident-response)
17. [Security Testing](#17-security-testing)
18. [Appendices](#18-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the comprehensive security architecture for Dr-Note, a healthcare application that manages Protected Health Information (PHI). It establishes security controls, standards, and procedures to protect patient data and ensure regulatory compliance.

### 1.2 Scope

This specification covers:
- Application-layer security
- Data protection mechanisms
- Authentication and authorization
- Infrastructure security
- Compliance requirements (HIPAA)
- Incident response procedures

### 1.3 Security Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Defense in Depth** | Multiple security layers | Client → Middleware → Server → Database → RLS |
| **Least Privilege** | Minimum required access | Role-based access control |
| **Zero Trust** | Never trust, always verify | Every request authenticated & authorized |
| **Separation of Duties** | Critical ops require multiple roles | Admin approval for sensitive changes |
| **Fail Secure** | System fails to secure state | Deny by default |
| **Complete Mediation** | Every access is checked | Middleware + RLS policies |
| **Psychological Acceptability** | Security shouldn't hinder usability | Seamless auth flow |

### 1.4 Threat Model

| Threat | Risk Level | Mitigation |
|--------|------------|------------|
| Unauthorized access to PHI | Critical | Authentication + RLS + Encryption |
| Data breach | Critical | Encryption + Access controls + Audit |
| SQL injection | High | Parameterized queries + Input validation |
| XSS attacks | High | CSP + Input sanitization |
| CSRF attacks | Medium | SameSite cookies + CSRF tokens |
| Session hijacking | High | HTTP-only cookies + Token rotation |
| Insider threats | Medium | Audit logging + Access controls |
| DDoS | Medium | Rate limiting + CDN |
| Supply chain attack | Medium | Dependency auditing |

---

## 2. Security Architecture

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DR-NOTE SECURITY ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: CLIENT SECURITY                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ CSP Nonce   │ │ XSS Filter  │ │ HTTPS Only  │ │ Secure      │            │
│ │ Validation  │ │             │ │             │ │ Cookies     │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: MIDDLEWARE SECURITY                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Session     │ │ Rate        │ │ CSRF        │ │ Request     │            │
│ │ Validation  │ │ Limiting    │ │ Protection  │ │ Sanitization│            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: SERVER SECURITY                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Auth        │ │ Role        │ │ Input       │ │ Audit       │            │
│ │ Verification│ │ Authorization│ │ Validation │ │ Logging     │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: DATABASE SECURITY                                                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Row Level   │ │ Encryption  │ │ Parameterized│ │ Backup &    │            │
│ │ Security    │ │ at Rest     │ │ Queries     │ │ Recovery    │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Security Controls Matrix

| Control Type | Control | Status | Location |
|--------------|---------|--------|----------|
| **Preventive** | Authentication | ✅ Implemented | Supabase Auth |
| **Preventive** | Authorization (RBAC) | ✅ Implemented | RLS + Middleware |
| **Preventive** | Input Validation | ✅ Implemented | Zod Schemas |
| **Preventive** | Rate Limiting | ✅ Implemented | Upstash Redis |
| **Preventive** | CSP Headers | ✅ Implemented | Next.js Config |
| **Preventive** | SQL Injection Prevention | ✅ Implemented | Supabase Client |
| **Detective** | Audit Logging | ✅ Implemented | audit_logs table |
| **Detective** | Anomaly Detection | ⏳ Planned | Phase 4 |
| **Corrective** | Session Expiry | ✅ Implemented | Middleware |
| **Corrective** | Token Rotation | ✅ Configured | Supabase |

---

## 3. Authentication

### 3.1 Authentication Methods

| Method | Use Case | Implementation |
|--------|----------|----------------|
| Email/Password | Primary authentication | Supabase Auth |
| MFA (TOTP) | Admin/Doctor accounts | Phase 3 |
| OAuth | Social login (optional) | Phase 3 |
| Magic Link | Passwordless (optional) | Future |

### 3.2 Password Requirements

```typescript
// src/lib/validations/user.ts
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  )
```

| Requirement | Value | Rationale |
|-------------|-------|-----------|
| Minimum length | 8 characters | NIST recommendation |
| Maximum length | 128 characters | Prevent DoS |
| Uppercase required | Yes | Complexity |
| Lowercase required | Yes | Complexity |
| Number required | Yes | Complexity |
| Special character required | Yes | Complexity |
| Common password check | Yes | Prevent dictionary attacks |
| Breached password check | Yes | HaveIBeenPwned API |

### 3.3 Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Validate │────▶│ Supabase │────▶│ Database │
│          │     │ Input    │     │ Auth     │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │               │                │                │
     │ 1. Submit     │                │                │
     │   {email,     │                │                │
     │    password,  │                │                │
     │    role}      │                │                │
     │──────────────▶│                │                │
     │               │ 2. Zod         │                │
     │               │   validate     │                │
     │               │───────────────▶│                │
     │               │                │ 3. Create      │
     │               │                │   auth.users   │
     │               │                │───────────────▶│
     │               │                │                │ 4. Trigger
     │               │                │                │   handle_new_user
     │               │                │                │
     │               │                │ 5. Create      │
     │               │                │   public.users │
     │               │                │◀───────────────│
     │               │                │                │
     │ 6. Return     │                │                │
     │   session     │                │                │
     │◀──────────────│◀───────────────│                │
```

### 3.4 Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Rate     │────▶│ Supabase │────▶│ Audit    │
│          │     │ Limit    │     │ Auth     │     │ Log      │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │               │                │                │
     │ 1. POST       │                │                │
     │   /auth/login │                │                │
     │──────────────▶│                │                │
     │               │ 2. Check       │                │
     │               │   rate limit   │                │
     │               │───────────────▶│                │
     │               │                │ 3. Verify      │
     │               │                │   credentials  │
     │               │                │───────────────▶│
     │               │                │                │ 4. Log
     │               │                │                │   attempt
     │               │                │                │
     │ 5. Set-Cookie │                │                │
     │◀──────────────│◀───────────────│                │
```

### 3.5 Token Structure

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "sub": "uuid-of-user",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "full_name": "Dr. Smith",
    "role": "doctor",
    "email_verified": true
  }
}
```

**Note**: Application role is in `user_metadata.role`, not JWT `role` claim.

### 3.6 Token Rotation

| Token Type | Lifetime | Rotation | Storage |
|------------|----------|----------|---------|
| Access Token | 1 hour | On refresh | HTTP-only cookie |
| Refresh Token | 7 days | On use (rotation) | HTTP-only cookie |
| ID Token | 1 hour | On refresh | Not stored |

---

## 4. Authorization

### 4.1 Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | System administrator | Full access to all resources |
| `doctor` | Medical professional | Manage own consultations, view assigned patients |
| `nurse` | Clinical staff | View all patients, limited updates |
| `receptionist` | Front desk staff | Patient registration, scheduling |

### 4.2 Permission Matrix

#### Patients Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT | ✅ All | ✅ Assigned | ✅ All | ✅ All |
| INSERT | ✅ | ❌ | ❌ | ✅ |
| UPDATE | ✅ | ⚠️ Assigned | ✅ | ✅ |
| DELETE | ✅ | ❌ | ❌ | ❌ |

#### Consultations Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT | ✅ All | ✅ Own | ✅ All | ✅ All |
| INSERT | ✅ | ✅ Own | ❌ | ❌ |
| UPDATE | ✅ | ✅ Own | ⚠️ Limited | ❌ |
| DELETE | ✅ | ❌ | ❌ | ❌ |

#### Users Table

| Operation | Admin | Doctor | Nurse | Receptionist |
|-----------|-------|--------|-------|--------------|
| SELECT | ✅ All | ✅ Own | ✅ Own | ✅ Own |
| INSERT | ✅ | ❌ | ❌ | ❌ |
| UPDATE | ✅ All | ✅ Own | ✅ Own | ✅ Own |
| DELETE | ✅ | ❌ | ❌ | ❌ |

### 4.3 RLS Policies

```sql
-- ============================================
-- USERS TABLE
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
-- PATIENTS TABLE
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
-- CONSULTATIONS TABLE
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

### 4.4 Server-Side Authorization

```typescript
// src/lib/security.ts

/**
 * Require specific role(s)
 */
export async function requireRole(allowedRoles: UserRole[]) {
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
  
  if (profile.role !== 'doctor') return true
  
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

---

## 5. Session Management

### 5.1 Session Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| Cookie Name | `sb-{project-ref}-` | Namespaced per project |
| Lifetime | 7 days | Balance security/usability |
| SameSite | Lax | CSRF protection |
| Secure | true (prod) | HTTPS only |
| HttpOnly | true | Prevent XSS theft |
| Path | / | Available on all routes |

### 5.2 Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SESSION LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. CREATION (Login)
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Client  │────▶│ Supabase │────▶│  Cookie  │
   │          │      │   Auth   │      │  Set     │
   └──────────┘      └──────────┘      └──────────┘
         │
         ▼
   Session created: {access_token, refresh_token}

2. VALIDATION (Every Request)
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Client  │────▶│Middleware│────▶│ Supabase │
   │          │      │          │      │   API    │
   └──────────┘      └──────────┘      └──────────┘
         │
         ▼
   getUser() validates JWT

3. REFRESH (Before Expiry)
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Client  │────▶│ Supabase │────▶│ New      │
   │          │      │   Auth   │      │ Tokens   │
   └──────────┘      └──────────┘      └──────────┘
         │
         ▼
   Old refresh token invalidated

4. TERMINATION
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Client  │────▶│ Supabase │────▶│ Cookies  │
   │  Logout  │      │   Auth   │      │ Cleared  │
   └──────────┘      └──────────┘      └──────────┘
```

### 5.3 Session Timeout

| Timeout Type | Duration | Action |
|--------------|----------|--------|
| Idle Timeout | 30 minutes | Show warning at T-5min |
| Absolute Timeout | 24 hours | Force re-authentication |
| Token Rotation | 1 hour | New tokens issued |

### 5.4 Session Timeout Warning

```typescript
// src/components/auth/SessionTimeout.tsx
export function SessionTimeout({ warningMinutes = 5 }) {
  // Shows warning modal 5 minutes before expiry
  // Allows user to extend session or logout
  // Auto-logouts at T-0
}
```

---

## 6. Data Protection

### 6.1 Data Classification

| Level | Data Examples | Storage | Access |
|-------|---------------|---------|--------|
| **PHI (Critical)** | Patient names, diagnoses, medical history | Encrypted at rest | Doctor, Nurse (assigned), Admin |
| **PII (High)** | Emails, phone numbers, addresses | Encrypted at rest | All authenticated users |
| **Credentials** | Passwords, tokens | Hashed/encrypted | Never exposed |
| **System** | Audit logs, settings | Encrypted at rest | Admin only |
| **Public** | Login page, public info | Standard | Anonymous |

### 6.2 Encryption

#### At Rest

| Data Type | Method | Implementation |
|-----------|--------|----------------|
| Database | AES-256 | Supabase default |
| Backups | AES-256 | Supabase default |
| Files | AES-256 | Supabase Storage |

#### In Transit

| Connection | Method | Implementation |
|------------|--------|----------------|
| Client → Server | TLS 1.3 | HTTPS enforced |
| Server → Database | TLS 1.2+ | Supabase internal |
| Server → Redis | TLS 1.2+ | Upstash default |

### 6.3 Data Masking

```typescript
// Sensitive data masking for logs
export function maskSensitiveData(data: Record<string, unknown>) {
  const sensitiveFields = ['password', 'token', 'ssn', 'credit_card']
  
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        return [key, '***MASKED***']
      }
      return [key, value]
    })
  )
}
```

### 6.4 Data Retention

| Data Type | Retention Period | Disposal Method |
|-----------|------------------|-----------------|
| Patient records | 7 years (HIPAA) | Secure deletion |
| Audit logs | 6 years (HIPAA) | Archive then delete |
| User accounts | Until deletion request | Soft delete, then purge |
| Session data | 7 days | Automatic expiry |
| Backups | 1 year | Encrypted deletion |

### 6.5 Backup Security

| Control | Implementation |
|---------|----------------|
| Encryption | AES-256 at rest |
| Access Control | Admin only |
| Frequency | Daily |
| Retention | 1 year |
| Testing | Monthly restore test |

---

## 7. API Security

### 7.1 API Protection Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API SECURITY LAYERS                                │
└─────────────────────────────────────────────────────────────────────────────┘

Request Flow:
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Client  │──▶│   CDN    │──▶│Middleware│──▶│  Server  │──▶│ Database │
│          │   │          │   │          │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                     │              │              │              │
                DDoS Protection  Rate Limit   Auth Check    RLS Policies
                SSL/TLS         CSRF Check   Role Check    Encryption
```

### 7.2 Endpoint Security

```typescript
// Protected API route pattern
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit check
    const { success } = await checkRateLimit(request.ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 2. Authentication
    const { user, profile } = await requireRole(['admin', 'receptionist'])

    // 3. Input validation
    const body = await request.json()
    const validated = PatientSchema.parse(body)

    // 4. Database operation (RLS enforced)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('patients')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    // 5. Audit log
    await auditLog('patient.create', 'patient', data.id, { user_role: profile.role })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    // Error handling
  }
}
```

### 7.3 CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://dr-note.example.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
}
```

### 7.4 Request Validation

```typescript
// Middleware request validation
export function validateRequest(request: NextRequest) {
  // Check content type
  const contentType = request.headers.get('content-type')
  if (request.method === 'POST' && !contentType?.includes('application/json')) {
    return false
  }

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip']
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header)
    if (value && containsSuspiciousPatterns(value)) {
      return false
    }
  }

  return true
}
```

---

## 8. Input Validation & Sanitization

### 8.1 Validation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INPUT VALIDATION FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. CLIENT-SIDE (First Defense)
   ┌──────────┐
   │  Form    │──▶ Zod Schema Validation
   │  Input   │    • Type checking
   └──────────┘    • Format validation
                   • Length limits

2. SERVER-SIDE (Primary Defense)
   ┌──────────┐
   │  Request │──▶ Zod Schema Parsing
   │  Body    │    • Strict validation
   └──────────┘    • Type coercion
                   • Custom validators

3. DATABASE (Final Defense)
   ┌──────────┐
   │  Query   │──▶ RLS Policies
   │          │    • Column constraints
   └──────────┘    • Foreign key checks
```

### 8.2 Zod Schemas

```typescript
// Patient validation
export const PatientSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  date_of_birth: z
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date('1900-01-01'), 'Date of birth must be after 1900'),

  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
  }),
})
```

### 8.3 Sanitization

```typescript
// src/lib/sanitize.ts

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return ''

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newline and tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Encode HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Check for potentially malicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,

    // XSS patterns
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,

    // Path traversal
    /\.\.\//g,
    /\.\.\\/g,

    // Command injection
    /[;&|`$]/g,
  ]

  return suspiciousPatterns.some((pattern) => pattern.test(input))
}
```

---

## 9. Rate Limiting

### 9.1 Rate Limiting Strategy

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/auth/login` | 5 requests | 60 seconds | Prevent brute force |
| `/auth/register` | 3 requests | 60 seconds | Prevent spam |
| `/auth/forgot-password` | 3 requests | 60 seconds | Prevent email bombing |
| `/api/patients` | 10 requests | 10 seconds | Protect patient data |
| `/api/consultations` | 10 requests | 10 seconds | Protect medical records |
| `/api/*` (global) | 100 requests | 60 seconds | General protection |

### 9.2 Implementation

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Auth rate limiter - 5 requests per minute
 */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
})

/**
 * Global rate limiter - 10 requests per 10 seconds
 */
export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = globalRatelimit
) {
  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  }
}
```

### 9.3 Rate Limit Response

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 30
}
```

**HTTP Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 30
```

---

## 10. Security Headers & CSP

### 10.1 Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable features |
| `Content-Security-Policy` | See below | Prevent XSS |

### 10.2 Content Security Policy

```
default-src 'self';
script-src 'self' 'nonce-{random}' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

### 10.3 CSP Implementation

```typescript
// src/lib/nonce.ts
import { randomBytes } from "crypto"

export function generateNonce(): string {
  return randomBytes(16).toString("base64")
}

export function getCSP(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  return directives.join("; ")
}
```

---

## 11. Audit Logging

### 11.1 Required Audit Events

| Category | Events | Priority |
|----------|--------|----------|
| **Authentication** | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGE | High |
| **User Management** | USER_CREATE, USER_UPDATE, USER_DELETE, ROLE_CHANGE | High |
| **Patient Data** | PATIENT_CREATE, PATIENT_UPDATE, PATIENT_DELETE, PATIENT_VIEW | Critical |
| **Consultations** | CONSULTATION_CREATE, CONSULTATION_UPDATE, CONSULTATION_DELETE | Critical |
| **System** | SETTINGS_UPDATE, EXPORT_DATA, EMERGENCY_ACCESS | High |

### 11.2 Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11.3 Audit Implementation

```typescript
// src/lib/audit.ts
export async function auditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const headerStore = await headers()
  const ipAddress = headerStore.get('x-forwarded-for') || 'unknown'
  const userAgent = headerStore.get('user-agent') || 'unknown'

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}
```

---

## 12. Error Handling

### 12.1 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### 12.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### 12.3 Error Handling Rules

| Rule | Implementation |
|------|----------------|
| Never expose stack traces | Use generic error messages |
| Log errors server-side | Audit trail |
| Sanitize error messages | Remove sensitive data |
| Consistent error format | Standardized response |

### 12.4 Secure Error Handler

```typescript
// src/lib/error-handler.ts
export function handleError(error: unknown) {
  // Log error server-side
  console.error('Error:', error)

  // Don't expose internal errors to client
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', details: error.errors } },
      { status: 400 }
    )
  }

  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  // Generic error for everything else
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  )
}
```

---

## 13. Infrastructure Security

### 13.1 Deployment Security

| Control | Implementation |
|---------|----------------|
| HTTPS | Enforced via Vercel/Netlify |
| SSL/TLS | TLS 1.3 |
| DDoS Protection | Cloudflare/Vercel Edge |
| WAF | Cloudflare WAF |
| CDN | Vercel Edge Network |

### 13.2 Environment Security

| Variable | Storage | Access |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Server only |
| `UPSTASH_REDIS_REST_URL` | `.env.local` | Server only |
| `UPSTASH_REDIS_REST_TOKEN` | `.env.local` | Server only |
| `CSRF_SECRET` | `.env.local` | Server only |

### 13.3 Git Security

| Rule | Implementation |
|------|----------------|
| Never commit secrets | `.gitignore` includes `.env*` |
| Scan for secrets | Pre-commit hooks |
| Rotate compromised keys | Immediate rotation policy |

### 13.4 Dependency Security

```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

---

## 14. Dependency Security

### 14.1 Security Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `@supabase/ssr` | Secure auth | ^0.12.0 |
| `@supabase/supabase-js` | Database client | ^2.110.1 |
| `@upstash/ratelimit` | Rate limiting | ^2.0.0 |
| `@upstash/redis` | Redis client | ^1.34.0 |
| `zod` | Input validation | ^3.x |

### 14.2 Dependency Auditing

```json
// package.json - Add audit script
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix"
  }
}
```

### 14.3 Automated Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security audit
        run: npm audit --production
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 15. HIPAA Compliance

### 15.1 Technical Safeguards

| Safeguard | Requirement | Implementation |
|-----------|-------------|----------------|
| **Access Control** | Unique user identification | Supabase Auth user IDs |
| | Emergency access | Break-glass procedure |
| | Automatic logoff | 30-min idle timeout |
| | Encryption | AES-256 at rest, TLS in transit |
| **Audit Controls** | Activity logs | audit_logs table |
| | Integrity checks | UUID primary keys |
| | Authentication | JWT + RLS |
| **Integrity** | Data authentication | HMAC signatures |
| | Transmission integrity | TLS 1.3 |
| **Authentication** | Person/entity | Supabase Auth |
| | Device | Session management |
| **Transmission Security** | Encryption | HTTPS everywhere |
| | Integrity | TLS |
| | Authentication | Certificate validation |

### 15.2 Administrative Safeguards

| Safeguard | Implementation |
|-----------|----------------|
| Security Officer | Designated role |
| Workforce Training | Security awareness program |
| Information System Activity Review | Monthly audit log review |
| Contingency Plan | Backup and recovery procedures |
| Evaluation | Quarterly security assessments |

### 15.3 Physical Safeguards

| Safeguard | Implementation |
|-----------|----------------|
| Facility Access | Supabase/Vercel data centers |
| Workstation Use | Secure development practices |
| Device Controls | MDM policies |

### 15.4 HIPAA Checklist

- [ ] Access controls implemented
- [ ] Audit logging enabled
- [ ] Encryption at rest and in transit
- [ ] Emergency access procedure documented
- [ ] Automatic logoff configured
- [ ] Data backup procedures in place
- [ ] Incident response plan documented
- [ ] Business Associate Agreement (BAA) with Supabase
- [ ] Risk assessment completed
- [ ] Workforce training documented

---

## 16. Incident Response

### 16.1 Incident Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | PHI breach, system compromise | Immediate |
| **High** | Successful attack, data exposure | 1 hour |
| **Medium** | Attempted attack, no breach | 4 hours |
| **Low** | Suspicious activity | 24 hours |

### 16.2 Response Procedures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INCIDENT RESPONSE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. DETECTION
   ┌──────────┐      ┌──────────┐
   │  Alert   │────▶│  Verify  │
   │  System  │      │  Incident│
   └──────────┘      └──────────┘
         │
         ▼
2. CONTAINMENT
   ┌──────────┐      ┌──────────┐
   │  Isolate │────▶│  Preserve│
   │  System  │      │  Evidence│
   └──────────┘      └──────────┘
         │
         ▼
3. ERADICATION
   ┌──────────┐      ┌──────────┐
   │  Remove  │────▶│  Patch   │
   │  Threat  │      │  System  │
   └──────────┘      └──────────┘
         │
         ▼
4. RECOVERY
   ┌──────────┐      ┌──────────┐
   │  Restore │────▶│  Verify  │
   │  System  │      │  Integrity│
   └──────────┘      └──────────┘
         │
         ▼
5. POST-INCIDENT
   ┌──────────┐      ┌──────────┐
   │  Review  │────▶│  Update  │
   │  Lessons │      │  Controls│
   └──────────┘      └──────────┘
```

### 16.3 Contact Information

| Role | Contact | Availability |
|------|---------|--------------|
| Security Officer | [Name] | 24/7 |
| Technical Lead | [Name] | Business hours |
| Legal Counsel | [Name] | On-call |
| Supabase Support | support@supabase.io | 24/7 |

---

## 17. Security Testing

### 17.1 Testing Types

| Type | Frequency | Tools |
|------|-----------|-------|
| Static Analysis | Every PR | ESLint, TypeScript |
| Dependency Scanning | Daily | npm audit, Snyk |
| Penetration Testing | Quarterly | OWASP ZAP, Burp Suite |
| Security Code Review | Every PR | Manual review |
| Compliance Audit | Annually | Third-party auditor |

### 17.2 Test Cases

| ID | Test Case | Priority |
|----|-----------|----------|
| SEC-001 | Unauthenticated access blocked | Critical |
| SEC-002 | Role-based access enforced | Critical |
| SEC-003 | SQL injection prevented | Critical |
| SEC-004 | XSS attacks prevented | High |
| SEC-005 | CSRF protection works | High |
| SEC-006 | Rate limiting enforced | Medium |
| SEC-007 | Session expiry works | Medium |
| SEC-008 | Audit logs created | High |
| SEC-009 | Error messages sanitized | Medium |
| SEC-010 | CSP headers present | Medium |

### 17.3 Security Test Implementation

```typescript
// tests/security/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('SEC-001: Unauthenticated access blocked', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('SEC-002: Role-based access enforced', async ({ browser }) => {
    // Login as receptionist
    const context = await browser.newContext()
    const page = await context.newPage()
    // ... login logic

    // Try to access admin-only route
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/unauthorized')
  })

  test('SEC-006: Rate limiting enforced', async ({ request }) => {
    // Send 11 requests in 10 seconds
    for (let i = 0; i < 11; i++) {
      await request.get('/api/patients')
    }
    // 11th request should be rate limited
    const response = await request.get('/api/patients')
    expect(response.status()).toBe(429)
  })
})
```

---

## 18. Appendices

### Appendix A: Security Checklist

#### Development Phase

- [ ] Input validation on all endpoints
- [ ] Authentication required for protected routes
- [ ] Authorization checks for role-based access
- [ ] Audit logging for sensitive operations
- [ ] Error messages sanitized
- [ ] No secrets in source code

#### Deployment Phase

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSP headers implemented
- [ ] Rate limiting enabled
- [ ] Database RLS policies active

#### Operations Phase

- [ ] Monitoring enabled
- [ ] Alerting configured
- [ ] Backup procedures tested
- [ ] Incident response plan documented
- [ ] Security training completed

### Appendix B: Security Resources

| Resource | URL |
|----------|-----|
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ |
| HIPAA Security Rule | https://www.hhs.gov/hipaa/for-professionals/security/index.html |
| NIST Cybersecurity Framework | https://www.nist.gov/cyberframework |
| Supabase Security | https://supabase.com/docs/guides/platform/going-into-prod |

### Appendix C: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-11 | Security Team | Initial release |

---

**Document End**
