-- ============================================================================
-- Widen users SELECT policy for patient search (visit creation flow)
--
-- Problem: searchPatients() queries the users table with
--   .or(`name.ilike.%query%, email.ilike.%query%`)
-- but the users_select policy only allows users.manage (admin) or self-read.
-- Receptionists (who have patients.create + patients.read) cannot search for
-- patients, so the visit creation form returns empty results.
--
-- Fix: Add patients.read to the SELECT policy so any staff member who can
-- read patient profiles can also search users by name/email.
-- ============================================================================

drop policy if exists users_select on users;

create policy users_select on users for select
  using (
    has_permission('users.manage')
    or id = auth.uid()
    or has_permission('patients.read')
  );
