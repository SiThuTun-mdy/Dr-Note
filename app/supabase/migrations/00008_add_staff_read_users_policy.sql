-- ============================================================================
-- Additive policy: allow staff with patients.read to view any user row
--
-- Multiple 00004 migrations created conflicting users_select policies.
-- Instead of dropping/recreating, we ADD a new policy with a different name.
-- PostgreSQL OR's all policies together — this is purely additive.
-- ============================================================================

-- Only create if the restrictive policy from 00004_patient_profile exists
-- (which limits patients.read to patient-role rows only)
create policy users_select_staff_read on users for select
  using (
    has_permission('patients.read')
  );
