# Dr.Note — Review Report

| Field | Value |
|---|---|
| **Date** | 2026-07-15 |
| **Phase** | Phase 5: Code Review |
| **Scope** | Branch `feat/user-profile-view-edit` (staff-profile feature, working tree) |
| **Reviewer** | Copilot CLI |

---

## Executive Summary

The staff-profile implementation follows the project architecture (server actions + zod validation + feature-scoped components), but one **High** security finding blocks approval: the current RLS update policy on `staff_profiles` allows non-admin users to update their own staff work fields directly.

---

## Findings

### Critical

None.

### High

1. **RLS authorization bypass for staff work fields**
   - **What:** The app logic intends `staff_code` and `department` to be admin-managed (`users.manage`) only, but the DB policy still allows self-updates.
   - **Where:** `supabase/migrations/00001_initial_schema.sql` → `create policy staff_profiles_update ... using (user_id = auth.uid() or has_permission('users.manage'));`
   - **Impact:** Any authenticated staff user can bypass the server action restriction and update their own `staff_profiles` row through direct Supabase calls.
   - **Recommendation:** Tighten policy to admin-only updates (and enforce with `with check`), aligned with the feature rule in `src/components/features/staff/staff-profile-actions.ts`.

### Medium

None.

### Low

None.

---

## Review Checklist

| Area | Result | Notes |
|---|---|---|
| Architecture consistency | ✅ Pass | Uses feature modules, server actions for writes, and server components for reads. |
| TypeScript quality | ✅ Pass | Strong typed action results and validation input types. |
| Framework best practices | ✅ Pass | App Router + server/client split is appropriate. |
| Database usage | ✅ Pass | Uses Supabase server client and relation selects correctly. |
| Auth/RBAC | ⚠️ Issue found | App-level admin guard exists, but DB-level policy is too permissive. |
| RLS/data access policies | ❌ Fail | `staff_profiles_update` permits self-update and conflicts with admin-only work-field intent. |
| Input validation | ✅ Pass | `staffProfileUpdateSchema` validates all submitted form fields. |
| Error handling | ✅ Pass | Action paths return user-safe errors and log server-side context. |
| Security risks | ❌ Fail | High-severity authorization bypass at RLS layer. |
| Maintainability | ✅ Pass | Clear separation between data action and form/view component. |

---

## Decision

**Not approved for QA sign-off / merge** until the High RLS finding is resolved.
