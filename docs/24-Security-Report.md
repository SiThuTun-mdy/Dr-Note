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

---

## Emergency contacts section on registration (13 Jul 2026)

Follow-up, requested directly: a reusable "emergency contacts" component, added as a section inside the patient registration form — its own `<form>`, submit disabled until the patient exists, errors surfaced via toast + inline retry.

**Files added:** `src/components/features/patients/emergency-contacts.tsx` (component), `emergency-contacts-actions.ts` (`addEmergencyContact`, `removeEmergencyContact`), `emergency-contacts-actions.test.ts`. Changed: `patient-registration-form.tsx` (tracks `patientId`, locks fields post-submit, no longer navigates away), `lib/validators/patient.ts` (`emergencyContactSchema`).

### Verified as sound
- No new RLS migration needed: `emergency_contacts_insert` already requires `patients.create`, `_update`/`_delete` already require `patients.update` — both held by admin/receptionist (checked against `00001_initial_schema.sql`, unchanged since #20).
- Both actions re-check auth (`getUser`) and role (admin/receptionist) server-side — the UI-disabled state on the add form (before a patient exists) is UX only, not the security boundary, per `docs/12-Architecture.md` §3.
- Add/remove failures each get their own inline "Something went wrong — retry" block (keeps the last-attempted values so Retry resubmits exactly what failed) plus a `toast.error`, matching design system §6.
- Live-verified: the add-contact form and its submit button are genuinely disabled (not just visually) before the patient is registered — confirmed via a real receptionist session in a browser (`isDisabled()` true pre-registration, and the section correctly identifies as the *last* `<form>` on the page, distinct from the patient form which shares some field names like "phone").

### Known gap — live E2E of the full add/remove cycle not completed
Registering a real patient to reach the "enabled" state hit the same Supabase `over_email_send_rate_limit` (429) documented in FIND-020-02 — the "Confirm email" setting appears to have reverted to ON again, or the built-in email quota is exhausted from earlier testing tonight. Added 9 unit tests (`emergency-contacts-actions.test.ts`, mocked Supabase client) covering both actions' auth/role/validation/success/failure paths instead, all passing. The add/remove/retry UI itself has **not** been driven through a real post-registration browser session — recommend a manual smoke test once the Supabase Auth email limit clears or "Confirm email" is confirmed off again.

### Gate status (superseded by the redesign below)
No Critical or High findings.

---

## Emergency contacts: redesigned to submit with registration (13 Jul 2026)

Direct follow-up superseding the section above: the emergency contacts UX changed from "separate form, enabled only after the patient is registered" to "collected as a draft list, submitted together with the single Register-patient action." The component is still fully reusable — it's now a controlled list (`contacts`/`onChange` props) with no server calls of its own, so it can drive either flow depending on what the parent wants.

**Files changed:** `emergency-contacts.tsx` (redesigned as a controlled draft-list, no longer calls `addEmergencyContact` itself), `patient-registration-form.tsx` (single submit sends patient fields + the draft contacts list together), `reception/patients/new/actions.ts` (`registerPatient` now accepts an `emergencyContacts` array and inserts them in the same call), plus 3 new tests in `actions.test.ts`.

### Design decision: partial-failure handling
`emergency_contacts` rows are inserted as one multi-row `insert()` *after* the patient (auth user + `users` + `patient_profiles` + `user_roles`) is already committed. Postgres treats a multi-row insert as one statement — it can't leave some contacts saved and others not — but the patient and the contacts are still two separate network calls, so failure between them is possible. If the patient succeeds but contacts fail, `registerPatient` returns `{ success: true, patientId, contactsError }` rather than treating it as a whole-request failure — because a whole-request retry would resubmit `signUp` for an email that now already exists, hitting the duplicate-email path incorrectly. The client surfaces `contactsError` via `toast.warning` + an inline retry block that re-attempts *only* the contacts, using the now-known `patientId` and the pre-existing single-contact `addEmergencyContact` action.

### Verified as sound
- Both `patientRegistrationSchema` and each entry in `emergencyContacts` are re-validated server-side inside `registerPatient` before anything is written — client-side RHF validation on the draft-add mini-form is UX only.
- No new RLS surface: the bulk insert into `emergency_contacts` runs under the same policy as before (`patients.create`), unchanged since #20.
- Live-verified in a browser (real receptionist session): empty-name draft-add is blocked client-side (no server call, list stays empty); two valid drafts add and display correctly; removing one from the draft list works; no console errors throughout. The final `registerPatient` network call was confirmed to carry the correct payload shape (`[{"name":"Jane Emergency","phone":"0912345678","relationship":"Sister"}]`) via server logs.
- Unit tests cover: full success with contacts, patient-succeeds-but-contacts-fail (`contactsError` set, `success` still `true`), and invalid-contact-blocks-before-signUp.

### Known gap — RESOLVED (13 Jul 2026, later same night)
The developer configured a custom SMTP provider in the Supabase dashboard, which removes the built-in email service's very low rate limit (Supabase's own docs describe the built-in provider as "intended for demonstration purposes only"). Full end-to-end run confirmed:
- `registerPatient` call succeeded (3.4s — consistent with a real SMTP round-trip, vs. the ~500-700ms fast-fail seen on every prior rate-limited attempt), toast showed "Patient registered", UI locked to the ✓ state correctly.
- Independently re-read via a separate admin session (not just trusting the action's return value): `users` row correct (`is_active: true`, right name/email), `patient_profiles` row correct (dob/gender set, untouched optional fields correctly `null`), `user_roles` correctly assigned the `patient` role, and the submitted `emergency_contacts` row landed with the right `patient_id`/name/relationship/phone.

This closes out the last open gap from both the #20 and emergency-contacts passes — the full combined registration flow (patient + emergency contact, single submit) is now verified working end-to-end against the live database, not just up to the network boundary.

### Gate status
No Critical or High findings. Full flow verified live end-to-end.

---

## Emergency contacts: reverted to separate form (13 Jul 2026, later same night)

Direct follow-up: the combined-submission design (previous two sections) was reverted back to the original separate-form approach — `EmergencyContactsSection` owns its own `<form>`, `addEmergencyContact`/`removeEmergencyContact` calls again, and stays disabled until `patientId` is set by a successful "Register patient" submit. `registerPatient` no longer accepts an `emergencyContacts` parameter or returns `contactsError` — `actions.ts` is now byte-identical to the version committed before the combined-submission redesign existed (confirmed via `git diff --stat HEAD`). The `contactsError`-retry code path in `patient-registration-form.tsx` is gone along with it. `emergency-contacts-actions.ts` (add/remove) and its tests were never touched by either redesign and needed no changes.

The "Register patient" button stays at the bottom-right (that was a separate, already-confirmed request, unaffected by this revert).

### Verified as sound (re-confirmed live, not just assumed from the earlier pass)
- Before registration: both the contact-name input and "Add contact" button are genuinely disabled (`isDisabled()` true via Playwright against a real receptionist session).
- After a successful "Register patient" submit: both become enabled, and adding a contact through its own separate submit succeeds.
- Independently re-read via a separate admin session: `users` row correct, and the added `emergency_contacts` row correctly linked to `patient_id` with the right name/relationship (phone left blank in this run, correctly stored as `null`).
- No console errors throughout; QA gates (typecheck, lint, build, tests) all pass — 36/36 tests (3 fewer than the combined-submission version, matching the removed `emergencyContacts`-in-`registerPatient` test cases; `emergency-contacts-actions.test.ts`'s 9 tests are unaffected).

### Gate status
No Critical or High findings.

---

## Password generator entropy refactor (13 Jul 2026)

Scope: `app/src/lib/utils/password.ts` (commit `2dd0cc0`) and added test coverage in `app/src/lib/utils/password.test.ts`.

### Findings

No new vulnerabilities identified in this scoped review.

### Verified as sound
- Random index generation now uses `crypto.randomInt(0, CHARSET.length)` instead of modulo-mapped bytes, removing modulo-bias risk in generated temporary passwords.
- Temp password generation remains server-side utility logic only; no service-role key exposure, no token/password logging, and no client-side secret handling introduced.
- New unit tests verify default length, custom length, and charset constraints for generated passwords.

### Gate status
No Critical or High findings.

---

## Full codebase security scan (14 Jul 2026)

Scope: all server actions, middleware, validators, auth flows, and Supabase helpers across the entire codebase.

### Findings

**[FIND-022-01] Severity: Critical — Secrets / Sensitive Data**
Category: Secrets
File: `app/.env.local`
Description: Real production credentials in plaintext including Supabase service role keys, GitHub PAT, and database passwords.
Impact: If accidentally committed, full admin access to Supabase projects and GitHub account.
Recommendation: Rotate ALL exposed credentials immediately. Use secrets manager.

**[FIND-022-02] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/admin/users/actions.ts:81-101` (assignRole)
Description: `assignRole()` checks auth but NOT admin role. Any authenticated user can assign any role.
Impact: Privilege escalation — nurse/doctor/receptionist could assign themselves admin role.
Recommendation: Add admin role check.

**[FIND-022-03] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/admin/users/actions.ts:104-123` (removeRole)
Description: `removeRole()` checks auth but NOT admin role.
Impact: Attacker could demote administrators.
Recommendation: Add admin role check.

**[FIND-022-04] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/admin/users/actions.ts:126-149` (toggleUserActive)
Description: `toggleUserActive()` checks auth but NOT admin role.
Impact: Attacker could deactivate all admin accounts.
Recommendation: Add admin role check.

**[FIND-022-05] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:26-44` (addDiagnosis)
Description: Zero auth/authz checks. Relies entirely on RLS.
Impact: If RLS misconfigured, any user could add diagnoses to any visit.
Recommendation: Add auth check and verify caller is assigned doctor.

**[FIND-022-06] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:46-60` (removeDiagnosis)
Description: Zero auth/authz checks.
Impact: Unauthorized deletion of diagnoses if RLS fails.
Recommendation: Add auth check and verify caller is assigned doctor.

**[FIND-022-07] Severity: High — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:62-76` (saveDiagnosisNote)
Description: Zero auth/authz checks.
Impact: Any user could overwrite diagnosis notes.
Recommendation: Add auth check and verify caller is assigned doctor.

**[FIND-022-08] Severity: Medium — Authentication**
Category: Authentication
File: `app/src/app/(auth)/login/actions.ts:8`
Description: In-memory rate limiting resets on restart, doesn't work across serverless instances.
Impact: Brute-force passwords by waiting for restart.
Recommendation: Use persistent store for rate limiting.

**[FIND-022-09] Severity: Medium — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:78-97` (searchDiagnoses)
Description: No auth check. Allows unauthenticated search of diagnosis codes.
Impact: Information disclosure.
Recommendation: Add auth check.

**[FIND-022-10] Severity: Medium — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:99-148` (getVisitWithDetails)
Description: No auth check. Fetches full visit details.
Impact: Exposure of patient medical records if RLS misconfigured.
Recommendation: Add auth check.

**[FIND-022-11] Severity: Medium — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:236-256` (getVisitPrescriptions)
Description: No auth check. Returns all prescriptions.
Impact: Exposure of prescription data.
Recommendation: Add auth check.

**[FIND-022-12] Severity: Medium — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/doctor/actions.ts:18-94` (getDoctorDashboardStats)
Description: Checks auth but not doctor role.
Impact: Non-doctors can access doctor-specific data.
Recommendation: Add role check.

**[FIND-022-13] Severity: Medium — Validation**
Category: Validation
File: `app/src/app/(dashboard)/doctor/visits/[id]/actions.ts:87` (searchDiagnoses)
Description: Query passed to `.or()` without escaping LIKE wildcards.
Impact: Pattern-based data extraction.
Recommendation: Apply safeQuery escaping.

**[FIND-022-14] Severity: Low — Sensitive Data**
Category: Sensitive Data
File: Multiple files
Description: `console.error()` logs internal user IDs and error objects.
Impact: Internal details visible in production logs.
Recommendation: Use structured logging with PII redaction.

**[FIND-022-15] Severity: Low — Authentication**
Category: Authentication
File: All server actions except login
Description: No rate limiting on write operations.
Impact: Authenticated attacker could flood system.
Recommendation: Add rate limiting for sensitive operations.

**[FIND-022-16] Severity: Low — Authorization**
Category: Authorization
File: `app/src/app/(dashboard)/admin/users/actions.ts:68-78` (getRoles)
Description: No auth check. Returns all roles.
Impact: Unauthenticated role enumeration.
Recommendation: Add auth check.

### Verified as sound
- Open redirect prevention validated
- No XSS patterns found
- No hardcoded secrets in code
- Zod validation on all server actions
- Generic error messages throughout
- Secure password generation (crypto.randomInt)
- File upload validation (MIME type, size, filename sanitization)
- Forward-only status transitions with role enforcement
- Middleware route protection with role-based prefixes

### Gate status
| Rule | Status |
|------|--------|
| Critical = 0 | ❌ FAIL (1 Critical) |
| High = 0 | ❌ FAIL (6 High) |
| Medium remediation plan | ❌ Required |

**Release Status: BLOCKED**
