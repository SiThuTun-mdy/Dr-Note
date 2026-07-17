-- ============================================================================
-- Widen users SELECT policy for doctor search
--
-- Problem: The 00004_patient_profile_users_rls migration restricts
-- users_select so that patients.read only allows reading users who have
-- the "patient" role. This blocks doctor search in visit creation.
--
-- Fix: Allow any user with patients.read to read ALL users (not just patients).
-- Staff need to see other staff members (doctors, nurses) for visit assignment.
-- ============================================================================

drop policy if exists users_select on users;

create policy users_select on users for select
  using (
    has_permission('users.manage')
    or id = auth.uid()
    or has_permission('patients.read')
  );
