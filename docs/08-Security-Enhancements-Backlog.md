# Security Enhancements Backlog

**Document ID**: 08  
**Version**: 1.0  
**Status**: Backlog  
**Created**: 2026-07-11  
**Priority**: Medium-High  

---

## Overview

This document tracks optional security enhancements identified during the security architecture review. These items should be implemented in future phases to harden the application's security posture.

---

## Enhancement Items

### 1. Content-Security-Policy Header Hardening

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Phase** | 2 |
| **Effort** | 2-3 days |
| **Risk Reduction** | XSS attack surface |

**Current State**: CSP allows `unsafe-eval` and `unsafe-inline`

**Target State**: Nonce-based CSP that restricts script execution

**Implementation**:
```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
        },
      ],
    },
  ],
}
```

**Acceptance Criteria**:
- [ ] CSP header present on all responses
- [ ] Scripts only execute with valid nonce
- [ ] No `unsafe-eval` or `unsafe-inline` in production
- [ ] CSP violation reports collected

---

### 2. Refresh Token Rotation

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Phase** | 2 |
| **Effort** | 1 day |
| **Risk Reduction** | Token theft window |

**Current State**: Refresh tokens don't rotate automatically

**Target State**: Tokens rotate on each use, invalidating stolen tokens

**Implementation**:
- Enable in Supabase Dashboard → Auth → Settings
- Set rotation interval to 1 hour
- Configure token reuse detection

**Acceptance Criteria**:
- [ ] Refresh token changes on each refresh
- [ ] Old tokens immediately invalid
- [ ] Stolen token detection alerts

---

### 3. Session Timeout Warnings

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Phase** | 2 |
| **Effort** | 2 days |
| **Risk Reduction** | User experience, data loss prevention |

**Current State**: Sessions expire silently

**Target State**: Users warned 5 minutes before expiry with option to extend

**Implementation**:
```typescript
// src/components/auth/SessionTimeout.tsx
// - Monitor session expiry
// - Show warning modal at T-5 minutes
// - Allow session extension
// - Auto-logout at T-0
```

**Acceptance Criteria**:
- [ ] Warning appears 5 minutes before expiry
- [ ] User can extend session
- [ ] Graceful logout with data preservation
- [ ] Works across browser tabs

---

### 4. Rate Limiting with Redis

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Phase** | 2 |
| **Effort** | 2 days |
| **Risk Reduction** | Brute force, DDoS |

**Current State**: In-memory rate limiting (resets on restart, single-instance only)

**Target State**: Distributed rate limiting via Redis

**Implementation**:
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
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

**Acceptance Criteria**:
- [ ] Rate limits persist across server restarts
- [ ] Works in serverless/multi-instance deployments
- [ ] Configurable per-endpoint limits
- [ ] Rate limit headers in responses

---

### 5. CSRF Token Implementation

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Phase** | 3 |
| **Effort** | 3 days |
| **Risk Reduction** | Cross-site request forgery |

**Current State**: SameSite cookies only

**Target State**: Explicit CSRF tokens for state-changing operations

**Implementation**:
```typescript
// src/lib/csrf.ts
import { createHmac, randomBytes } from 'crypto'

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  const signature = createHmac('sha256', process.env.CSRF_SECRET!)
    .update(token)
    .digest('hex')
  return `${token}.${signature}`
}
```

**Acceptance Criteria**:
- [ ] CSRF token generated per session
- [ ] Token validated on all POST/PUT/DELETE requests
- [ ] Token rotation on sensitive operations
- [ ] Clear error messages for invalid tokens

---

### 6. Multi-Factor Authentication (MFA)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Phase** | 3 |
| **Effort** | 5-7 days |
| **Risk Reduction** | Credential theft |

**Current State**: Single-factor (password only)

**Target State**: MFA required for admin and doctor roles

**Implementation**:
- TOTP (Time-based One-Time Password) via authenticator apps
- SMS backup method
- Recovery codes for account recovery
- Grace period for enrollment

**Acceptance Criteria**:
- [ ] MFA enforced for admin/doctor roles
- [ ] TOTP enrollment flow
- [ ] Backup codes generated and stored securely
- [ ] MFA bypass only via emergency access

---

### 7. Audit Log Anomaly Detection

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Phase** | 4 |
| **Effort** | 5-7 days |
| **Risk Reduction** | Insider threats, compromised accounts |

**Current State**: Manual audit log review

**Target State**: Real-time anomaly detection with alerts

**Implementation**:
- Pattern detection for suspicious activities
- Alert triggers for critical events
- Dashboard for security monitoring
- Integration with notification system

**Acceptance Criteria**:
- [ ] Multiple failed login alerts
- [ ] Unusual access pattern detection
- [ ] Bulk data export monitoring
- [ ] Role escalation attempt alerts

---

### 8. Emergency Access Enhancement

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Phase** | 3 |
| **Effort** | 2-3 days |
| **Risk Reduction** | HIPAA compliance, audit trail |

**Current State**: Basic emergency access logging

**Target State**: Comprehensive break-glass audit trail

**Implementation**:
```typescript
interface EmergencyAccessLog {
  user_id: string
  reason: string
  approved_by: string
  expires_at: Date
  patients_accessed: string[]
  actions_performed: string[]
}
```

**Acceptance Criteria**:
- [ ] Complete access trail during emergency
- [ ] Admin approval workflow
- [ ] Automatic expiration
- [ ] Post-incident review report

---

## Implementation Timeline

```
Phase 2 (2026-Q3)
├── CSP Hardening (2-3 days)
├── Token Rotation (1 day)
├── Session Warnings (2 days)
└── Redis Rate Limiting (2 days)

Phase 3 (2026-Q4)
├── CSRF Tokens (3 days)
├── MFA Implementation (5-7 days)
└── Emergency Access Enhancement (2-3 days)

Phase 4 (2027-Q1)
└── Anomaly Detection (5-7 days)
```

---

## Dependencies

| Enhancement | Dependencies |
|-------------|--------------|
| Rate Limiting | Upstash Redis account |
| MFA | Supabase Auth configuration |
| Anomaly Detection | Monitoring infrastructure |
| CSP Hardening | Nonce generation library |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| XSS vulnerability surface | High | Low |
| Token theft window | 7 days | 1 hour |
| Rate limit effectiveness | Single-instance | Distributed |
| MFA adoption (admin/doctor) | 0% | 100% |
| Anomaly detection coverage | Manual | Automated |

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Security Architect | - | - | Pending |
| Tech Lead | - | - | Pending |
| Product Owner | - | - | Pending |

---

**Document End**
