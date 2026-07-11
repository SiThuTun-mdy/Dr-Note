# Security Guardrails - Modification Note

**Date:** July 11, 2026
**Project:** Dr-Note
**Author:** Claude Code

---

## 📋 Summary

Added comprehensive security guardrails to protect against common vulnerabilities including XSS, SQL injection, authentication bypass, and unauthorized data access.

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `src/lib/audit.ts` | Audit logging for sensitive operations |
| `src/lib/sanitize.ts` | Input sanitization utilities |
| `src/lib/security.ts` | Authentication & authorization helpers |
| `src/lib/validations/patient.ts` | Patient data validation schema |
| `src/lib/validations/consultation.ts` | Consultation data validation schema |
| `src/lib/validations/user.ts` | User data validation schema |
| `src/lib/validations/index.ts` | Export all validations |
| `supabase/migrations/20260711000000_create_audit_logs.sql` | Audit logs database table |

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `.claude/CLAUDE.md` | Added security guardrails section |

---

## 🔐 Security Features

### 1. Agent Security Rules (CLAUDE.md)

**Location:** `.claude/CLAUDE.md`

Added comprehensive security rules for AI agents:

```markdown
## Security Guardrails

### ⚠️ NEVER Do These (Critical)
- ❌ Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- ❌ Never bypass Row-Level Security (RLS) policies
- ❌ Never execute raw SQL with user input
- ❌ Never expose API keys, secrets, or tokens in logs or commits
- ❌ Never store sensitive data in localStorage or sessionStorage
- ❌ Never skip authentication checks in server actions
- ❌ Never skip authorization checks (role-based access)
- ❌ Never trust user input - always validate with Zod

### ✅ ALWAYS Do These (Required)
- ✅ Always use `supabase.auth.getUser()` in server actions
- ✅ Always validate input with Zod schemas before processing
- ✅ Always use parameterized queries (Supabase handles this)
- ✅ Always sanitize user input before rendering (DOMPurify)
- ✅ Always log sensitive actions for audit trail
- ✅ Always use HTTPS in production
- ✅ Always store secrets in `.env.local` (not committed)
- ✅ Always check user role before data access
```

---

### 2. Input Validation (Zod Schemas)

**Location:** `src/lib/validations/`

#### Patient Schema (`patient.ts`)
```typescript
export const PatientSchema = z.object({
  first_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  last_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  date_of_birth: z.date().max(new Date()),
  gender: z.enum(['male', 'female', 'other']),
  // ... more fields
})
```

#### Consultation Schema (`consultation.ts`)
```typescript
export const ConsultationSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid().optional(),
  chief_complaint: z.string().min(1).max(1000),
  diagnosis: z.string().min(1).max(1000),
  prescription_items: z.array(z.object({
    medication_name: z.string().min(1).max(200),
    dosage: z.string().min(1).max(100),
    frequency: z.string().min(1).max(100),
  })).optional(),
}).refine(
  (data) => {
    if (data.prescription_items && data.prescription_items.length > 0) {
      return data.diagnosis && data.diagnosis.length > 0
    }
    return true
  },
  { message: 'Diagnosis is required when prescribing medication' }
)
```

#### User Schema (`user.ts`)
```typescript
export const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist']),
}).refine(
  (data) => data.password === data.confirm_password,
  { message: 'Passwords do not match' }
)
```

---

### 3. Audit Logging

**Location:** `src/lib/audit.ts`

```typescript
import { auditLog, AuditActions } from '@/lib/audit'

// Log sensitive operations
await auditLog(AuditActions.PATIENT_UPDATE, 'patient', patientId, { changes })
await auditLog(AuditActions.CONSULTATION_CREATE, 'consultation', consultationId)
await auditLog(AuditActions.USER_LOGIN, 'user', userId)
```

**Audit Actions Available:**
- `PATIENT_CREATE`, `PATIENT_UPDATE`, `PATIENT_DELETE`, `PATIENT_VIEW`
- `CONSULTATION_CREATE`, `CONSULTATION_UPDATE`, `CONSULTATION_DELETE`, `CONSULTATION_VIEW`
- `USER_LOGIN`, `USER_LOGOUT`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
- `ADMIN_ROLE_CHANGE`, `ADMIN_SETTINGS_UPDATE`

---

### 4. Input Sanitization

**Location:** `src/lib/sanitize.ts`

```typescript
import { sanitizeString, sanitizeObject, validateInput } from '@/lib/sanitize'

// Sanitize user input
const cleanInput = sanitizeString(userInput)

// Sanitize entire object
const cleanData = sanitizeObject(formData)

// Validate for suspicious patterns (SQL injection, XSS, etc.)
validateInput(userInput, 'notes') // Throws if malicious
```

**Features:**
- Remove control characters
- Encode HTML entities
- Detect SQL injection patterns
- Detect XSS patterns
- Detect path traversal attempts
- Detect command injection attempts

---

### 5. Security Helpers

**Location:** `src/lib/security.ts`

```typescript
import { requireAuth, requireRole, canAccessPatient } from '@/lib/security'

// Authentication check
const user = await requireAuth()

// Role-based authorization
await requireRole(['admin', 'doctor'])
await requireAdmin()
await requireDoctor()

// Resource access check
const canAccess = await canAccessPatient(patientId)
const canModify = await canModifyConsultation(consultationId)
```

**Available Functions:**
- `requireAuth()` - Check if user is authenticated
- `requireRole(roles)` - Check if user has required role
- `requireAdmin()` - Check if user is admin
- `requireDoctor()` - Check if user is doctor
- `requireNurse()` - Check if user is nurse
- `requireReceptionist()` - Check if user is receptionist
- `canAccessPatient(id)` - Check if user can access patient data
- `canModifyConsultation(id)` - Check if user can modify consultation
- `createSecurityHeaders()` - Create security headers for API responses
- `checkRateLimit(id)` - Simple rate limiting

---

### 6. Database Migration

**Location:** `supabase/migrations/20260711000000_create_audit_logs.sql`

Creates audit_logs table with:
- User ID tracking
- Action logging
- Resource type and ID
- JSONB details
- IP address and user agent
- RLS policies (admin can view, system can insert)
- Indexes for performance

---

## 🎯 Usage Examples

### Server Action with Security

```typescript
'use server'

import { requireAuth, requireRole } from '@/lib/security'
import { PatientSchema } from '@/lib/validations'
import { auditLog, AuditActions } from '@/lib/audit'
import { validateInput } from '@/lib/sanitize'

export async function createPatient(data: PatientData) {
  // 1. Authenticate
  const user = await requireAuth()
  
  // 2. Authorize
  await requireRole(['admin', 'receptionist'])
  
  // 3. Validate input
  const validated = PatientSchema.parse(data)
  
  // 4. Check for suspicious patterns
  validateInput(validated.first_name, 'first_name')
  validateInput(validated.last_name, 'last_name')
  
  // 5. Insert with RLS
  const { data: patient, error } = await supabase
    .from('patients')
    .insert(validated)
    .select()
    .single()
  
  if (error) throw error
  
  // 6. Audit log
  await auditLog(AuditActions.PATIENT_CREATE, 'patient', patient.id)
  
  return patient
}
```

### Form with Validation

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PatientSchema, PatientData } from '@/lib/validations'

export function PatientForm() {
  const form = useForm<PatientData>({
    resolver: zodResolver(PatientSchema),
  })

  // Form automatically validates with Zod
  // Shows validation errors to user
}
```

---

## 📊 Security Checklist

| Check | Status | Location |
|-------|--------|----------|
| Agent security rules | ✅ Added | `.claude/CLAUDE.md` |
| Input validation | ✅ Added | `src/lib/validations/` |
| Server action pattern | ✅ Documented | `.claude/CLAUDE.md` |
| Audit logging | ✅ Added | `src/lib/audit.ts` |
| Input sanitization | ✅ Added | `src/lib/sanitize.ts` |
| Auth helpers | ✅ Added | `src/lib/security.ts` |
| Audit logs table | ✅ Added | `supabase/migrations/` |

---

## 🔗 Related Documentation

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Validation](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📝 Next Steps

1. **Apply migration**: Run the audit logs migration to create the table
2. **Update server actions**: Add security checks to existing actions
3. **Add form validation**: Use Zod schemas in all forms
4. **Enable audit logging**: Add auditLog() calls to critical operations
5. **Test security**: Verify RLS policies work correctly

---

**Last Updated:** July 11, 2026
