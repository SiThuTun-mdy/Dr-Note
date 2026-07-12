# Security Report

Scope: reviewed after each feature per `CLAUDE.md`'s "Run security review after task implementation" rule. Entries are additive per feature — do not delete prior sections when appending.

---

## Issue #20 — Patient registration form (12 Jul 2026)

**Files reviewed:** `src/lib/supabase/service.ts`, `src/lib/utils/password.ts`, `src/lib/validators/patient.ts`, `src/app/(dashboard)/reception/patients/new/{page,actions,patient-registration-form}.tsx`, `src/components/ui/form.tsx`, `supabase/migrations/00003_patient_registration_rls.sql`.

### Findings

**[FIND-020-01] Severity: Medium — Authorization / RLS — RESOLVED, VERIFIED LIVE**
Category: RLS
File: `supabase/migrations/00003_patient_registration_rls.sql`
Description: The migration widening `users_insert` / `user_roles_insert` to permit receptionists to insert patient rows was applied to the live project. End-to-end verification (Playwright, real receptionist login, real form submission) confirms `users`, `patient_profiles`, and `user_roles` rows were all created correctly, then independently re-read via an admin session to confirm the data (name, email, dob, gender, `patient` role) matches what was submitted.

**[FIND-020-02] Severity: Low (security) / High (functional blocker) — Authentication / Config dependency — RESOLVED**
Category: Authentication
File: `src/app/(dashboard)/reception/patients/new/actions.ts` (signUp call)
Description: Live testing initially confirmed Supabase Auth's "Confirm email" setting was ON, causing every `signUp` to hit `over_email_send_rate_limit` (429). After the developer adjusted the Supabase Auth configuration, a follow-up live test with a real address completed successfully end-to-end with no errors.

**[FIND-020-05] Severity: Medium — Authorization / RLS — new, for #22**
Category: RLS
File: `supabase/migrations/00001_initial_schema.sql` (`users_select` policy)
Description: Verifying FIND-020-01 required reading back the newly-created `users` row as the receptionist who created it — this failed (`PGRST116`, 0 rows) because `users_select` only allows `has_permission('users.manage')` (admin-only) or `id = auth.uid()` (self). Only switching to an admin session could read the row. Receptionists, nurses, and doctors — all `patients.read` holders — currently cannot read `users` at all, only `patient_profiles`/`emergency_contacts`.
Impact: Not a data-leak risk (it's overly *restrictive*, not permissive), but it will block issue #22 (patient profile page) outright, since the profile view needs `users.name`/`email`/`phone` alongside `patient_profiles`, and doctors/nurses/receptionist/admin all need to see it per #22's acceptance criteria.
Recommendation: When starting #22, widen `users_select` to `using (has_permission('users.manage') or has_permission('patients.read') or id = auth.uid())`, mirroring the same pattern used for FIND-020-01. Not fixed in this pass — out of scope for #20, flagged for the next phase.

**[FIND-020-03] Severity: Low — Error handling / User enumeration**
Category: Error Handling
File: `src/app/(dashboard)/reception/patients/new/actions.ts`
Description: A duplicate-email submission returns a specific "This email is already registered" field error, which lets an authenticated receptionist/admin enumerate whether an email is already a registered patient.
Impact: Minimal — only reachable by already-authenticated staff roles (`admin`/`receptionist`), and the acceptance criteria for #20 explicitly requires this human-readable duplicate-email error. Accepted as by-design.
Recommendation: No change; documented as an accepted tradeoff.

**[FIND-020-04] Severity: Low — Error handling / brittle string match**
Category: Error Handling
File: `src/app/(dashboard)/reception/patients/new/actions.ts`
Description: Duplicate-email detection matches on `signUpError.message.toLowerCase().includes("already registered")`, a substring check against the Supabase SDK's error text rather than an error code.
Impact: If a future SDK version changes this message, the duplicate case silently falls through to the generic error instead of the field-level one — a UX regression, not a security hole. Same pattern already exists in `login/actions.ts` for `"Invalid login credentials"`.
Recommendation: No action needed now; worth switching to `error.code` if/when the JS SDK exposes a stable code for this case.

### Verified as sound
- Auth: `registerPatient` checks `auth.getUser()` before doing anything; unauthenticated calls are rejected.
- Authorization: role checked both at the page level (`redirect`) and inside the server action (defense in depth, matching the existing `(dashboard)/layout.tsx` pattern), with RLS as the ultimate backstop — confirmed live (FIND-020-01).
- Secrets: only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used (already public by convention); no service-role key anywhere in the new code, per `docs/12-Architecture.md` §3.
- Input validation: all fields validated server-side via `patientRegistrationSchema.safeParse` inside the action (not just client-side); DOB tightened during this review to a strict `YYYY-MM-DD` format that can't be in the future.
- Temp password: generated with `crypto.randomBytes` (16 chars, 64-char alphabet, ~96 bits entropy), never returned to the client or logged.
- Error responses: only generic, human-readable messages cross the server/client boundary; raw Postgres/Supabase errors are logged server-side only (`console.error`), never returned.
- No rollback/service-role deletion is attempted on partial failure (no service-role key available); orphaned auth users are logged with a `[PatientRegistration]` prefix for manual cleanup, consistent with the existing orphaned-user handling in `login/actions.ts`.

### Bugs found and fixed during live verification (not security findings, logged for traceability)
Driving the real flow in a browser (Playwright against `npm run dev`, logged in as the seeded receptionist) surfaced four functional bugs, all fixed in this pass:
- `<Toaster />` (sonner) was never mounted anywhere in the app — every `toast.success`/`toast.error` call in the whole codebase (including the pre-existing admin/users page) was a silent no-op. Fixed by mounting it in `src/app/layout.tsx`.
- The sidebar's "Register patient" link pointed at a stale placeholder route (`/patients/register`) that was never implemented, instead of this feature's actual route. Fixed in `src/components/layout/Sidebar.tsx`.
- Wiring the reception dashboard's "Register patient" button to `next/link` via Base UI's `render` prop tripped a `nativeButton` console warning (Base UI expects a real `<button>` unless told otherwise). Fixed with `nativeButton={false}`.
- The gender `Select` switched from uncontrolled to controlled on first selection (`field.value` started `undefined`), triggering a React warning. Fixed by defaulting to `field.value ?? ""`.
- The generic `signUp` failure branch never logged the underlying Supabase error server-side, which would have made FIND-020-02 undiagnosable in production. Fixed by adding a `console.error` there.

### Gate status
No Critical or High findings. FIND-020-01 and FIND-020-02 are resolved and verified live end-to-end. FIND-020-05 (Medium) is a pre-existing RLS gap discovered during this verification pass; it doesn't block #20 (which only needs *insert*), but must be fixed before #22 (patient profile *view*) can work.

---

## Patient activation + set-password flow (13 Jul 2026)

Follow-up to #20, requested directly: patients are now `is_active: true` at registration (reversing the earlier D4-driven default), and a post-confirmation flow lets them set their own password.

**Files added/changed:** `src/lib/utils/site-url.ts`, `src/app/auth/confirm/route.ts`, `src/app/(auth)/set-password/{page,actions}.tsx`, `src/lib/validators/auth.ts` (`setPasswordSchema`), `src/lib/supabase/middleware.ts`, `src/app/(dashboard)/reception/patients/new/actions.ts` (`is_active: true`, `emailRedirectTo`).

### Findings

**[FIND-021-01] Severity: Critical (would-have-been) — Authorization / Middleware — FOUND AND FIXED PRE-COMMIT**
Category: Authorization
File: `src/lib/supabase/middleware.ts`
Description: The role-route allowlist (`roleRoutes`/`roleDashboard`) has no entry for the `patient` role and `/set-password` wasn't in the public-path list. A patient who legitimately clicked their confirmation email and landed on `/set-password` with a fresh session would have been immediately bounced back to `/login` by the middleware, before ever reaching the page — silently breaking the entire feature for every real user, not just a theoretical edge case.
Impact: Would have made this feature 100% non-functional in practice while appearing to work in every check that didn't drive a real authenticated request through the middleware (build, typecheck, unit tests of the page/action in isolation all pass fine).
Fix: Added `/set-password` to `isPublicPath` in `middleware.ts` (same treatment as `/auth/*`) — the route itself still requires a valid session via `auth.getUser()` inside the server action, so this doesn't weaken authorization, it just stops the middleware's *role*-route allowlist (which has no concept of the `patient` role at all) from intercepting it. Added two regression tests (`middleware.test.ts`): authenticated patient and unauthenticated visitor can both reach `/set-password` without a redirect.

**[FIND-021-02] Severity: Low — Authorization / Open redirect — mitigated by design**
Category: Authorization
File: `src/app/auth/confirm/route.ts`
Description: The confirmation route accepts a `next` query param (used to send the user to `/set-password` after verification). An attacker-controlled `next` could attempt an open redirect.
Mitigation: `next` is checked against a hardcoded allowlist (`ALLOWED_NEXT_PATHS = {"/set-password"}`) before use; any other value falls back to `/login`. Verified live: `next=https://evil.example.com` with a bogus `token_hash` correctly redirects to `/login?error=confirmation_failed`, never to the attacker URL.

### Verified as sound
- `setPassword` requires a live Supabase session (`auth.getUser()`) before calling `updateUser`; an expired/already-used confirmation link surfaces a human "This link has expired" message instead of silently doing nothing.
- `/auth/confirm` never logs or returns the `token_hash` itself; on failure it strips the query params before redirecting.
- No password is ever logged, including the temp password generated at registration (unchanged from #20) and the one the patient sets (validated client+server via `setPasswordSchema`, never persisted anywhere but Supabase Auth's own hashed storage via `updateUser`).
- After a successful password set, the session is signed out server-side (`auth.signOut()`) rather than left active with nowhere for the user to go (no patient dashboard exists yet).

### Known boundary (not fixed, flagged for the user's decision)
`login/actions.ts`'s `redirectMap` and `middleware.ts`'s `roleDashboard` still have no entry for `patient`. Concretely: a patient who successfully sets their password via this new flow **still cannot log in through `/login`** afterward — they'll hit the existing "Your account has no assigned role"-style rejection, because the app has no patient dashboard to send them to yet. This is intentionally out of scope here (not requested, and building a patient dashboard is a separate, unscoped feature) — the set-password page's success state says "contact the clinic to complete your account setup" rather than implying login will work, to avoid overpromising.

### Gate status
No Critical or High findings remaining — FIND-021-01 was Critical-severity but was caught and fixed before any commit, during this same review pass, by driving the flow through the real middleware rather than trusting unit tests of the page in isolation.
