# Code Review Report — fix/manual-test-bugs

**Date:** 2026-07-16
**Branch:** fix/manual-test-bugs
**Reviewer:** Claude (automated)
**Scope:** 25 files changed, +1458 / -264 lines

---

## Executive Summary

This branch resolves 9 manual test bugs and defers 3 auth-related items to Phase 2. The changes are functionally correct and well-structured. Three findings require attention before merge — one security-adjacent, one architectural, one performance. None are blockers for a demo deployment.

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 0 | — |
| 🟠 High | 2 | Should fix |
| 🟡 Medium | 4 | Recommend fix |
| 🟢 Low | 4 | Nice to have |

---

## 🟠 High Findings

### H1: Server action in component directory violates architecture §5

**File:** `src/components/features/patients/visit-detail-actions.ts`

The architecture guide (§5) states: *"One action per mutation, in `actions.ts` next to the route that owns it."* `visit-detail-actions.ts` is a server action (`"use server"`) placed inside a component directory. This breaks the convention and makes it harder to find server actions.

**Recommendation:** Move to `src/app/(dashboard)/patients/[id]/actions.ts` or create a shared `src/lib/actions/visit-detail.ts`.

**Risk:** Low for demo; affects long-term maintainability.

---

### H2: `searchDoctors` fetches ALL users on every keystroke

**File:** `src/app/(dashboard)/reception/visits/new/actions.ts:210-248`

The function fetches every row from `user_roles` and `users` tables, then filters in JavaScript. With 100 users this is fine; with 1,000+ it will cause noticeable lag. The function is called on every keystroke (no debounce).

**Recommendation:**
1. Add debounce (300ms) to `handleDoctorSearch` in `visit-creation-form.tsx`
2. Consider a database view or RPC for doctor search if user count grows

**Risk:** Performance degrades with scale. Acceptable for demo with small dataset.

---

## 🟡 Medium Findings

### M1: Internal Next.js import — isRedirectError

**File:** `src/app/(dashboard)/reception/visits/new/visit-creation-form.tsx:9`

```typescript
import { isRedirectError } from "next/dist/client/components/redirect-error"
```

This imports from Next.js internals, which is not a public API. It may break on Next.js version upgrades.

**Recommendation:** Use a try/catch with redirect() error detection pattern, or check if Next.js exposes a stable API for this.

**Risk:** May break on Next.js upgrade. Low probability for demo.

---

### M2: Type assertions hide potential runtime errors

**Files:**
- `src/app/(dashboard)/reception/visits/new/actions.ts:31,130,175,205,218`
- `src/components/features/patients/visit-detail-actions.ts` (multiple)

Multiple `as unknown as` casts bypass TypeScript's type checking.

**Recommendation:** Define proper types for Supabase query results or use zod to validate at runtime.

**Risk:** Type mismatches could cause runtime errors that TypeScript won't catch.

---

### M3: No input validation on visitId in server action

**File:** `src/components/features/patients/visit-detail-actions.ts`

The function accepts `visitId: string` but doesn't validate it's a valid UUID before using it in a query. While RLS protects against unauthorized access, a malformed ID could cause a PostgREST error.

**Recommendation:** Validate visitId with the same lenient UUID regex used in visit.ts.

**Risk:** Low — RLS is the real boundary. But defensive validation is best practice.

---

### M4: ExpandedVisitDetail type assertion after filter

**File:** `src/components/features/patients/patient-visits-data-table.tsx:85`

```typescript
.filter(Boolean) as Array<{ label: string; value: string }>
```

This works correctly but is fragile — adding a new vital with a different shape would silently pass.

**Recommendation:** Use a typed filter: `.filter((v): v is Vital => Boolean(v))`

**Risk:** Low — currently correct, but fragile for future changes.

---

## 🟢 Low Findings

### L1: Redundant React imports

**File:** `src/components/features/patients/patient-visits-data-table.tsx:3-4`

`useTransition` is already available via the `React` namespace. The second import is redundant.

---

### L2: handleToggle not wrapped in useCallback

**File:** `src/components/features/patients/patient-visits-data-table.tsx:314`

`handleToggle` is recreated on every render, causing unnecessary re-renders of child components.

---

### L3: Lazy import of logout in Sidebar

**File:** `src/components/layout/Sidebar.tsx:265`

Dynamic import for a simple logout action is unusual. The logout button is always visible, so the import should be static.

---

### L4: Migration 00006 is destructive without backup

**File:** `supabase/migrations/00006_cleanup_orphaned_user_roles.sql`

DELETE statement permanently removes orphaned data. While correct, there's no backup step.

---

## ✅ What Looks Good

1. **Zod v4 UUID fix** — The lenient regex approach is correct and well-documented
2. **Controller for patientId** — Correctly binds value and onChange
3. **Expandable rows UX** — Well-structured 3-column grid layout with lazy loading
4. **RLS migrations** — All changes are additive (never remove access)
5. **Poll interval fix** — 10-second polling appropriate for queue system
6. **Address mandatory** — Correctly applied only to registration schema
7. **Status transition buttons** — Role-based visibility with useTransition
8. **Dead code cleanup** — Unused imports, functions removed

---

## Architecture Consistency Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Server Components by default | ✅ | Patient profile page is a server component |
| Server Actions for writes | ✅ | createVisit, transitionVisitStatus are server actions |
| RLS as security boundary | ✅ | All queries through Supabase client with RLS |
| Zod validation client + server | ✅ | visitCreationSchema used in both form and action |
| Folder structure §5 | ⚠️ | H1: server action in component dir |
| No ad-hoc Supabase clients | ✅ | All use createClient() |
| No service-role key in app code | ✅ | Verified — not present |

---

## Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| SQL injection | ✅ | Supabase parameterized queries + LIKE wildcard escaping |
| Auth bypass | ✅ | Server actions verify user and role before operations |
| RLS enforcement | ✅ | All queries through Supabase client; migrations additive |
| Input validation | ⚠️ | M3: visitId not validated in server action |
| Data exposure | ⚠️ | H2: searchDoctors fetches all users (filtered to 10) |
| Secrets in client bundle | ✅ | No SUPABASE_SERVICE_ROLE_KEY in client code |
| CSRF | ✅ | Next.js Server Actions have built-in CSRF protection |

---

## Verdict

**APPROVE with conditions:** Fix H1 (move server action) and H2 (add debounce) before merge. M1-M4 and L1-L4 are recommended but not blocking.

The branch is safe for demo deployment. The RLS changes are additive and verified. The functional fixes address real user-reported bugs.
