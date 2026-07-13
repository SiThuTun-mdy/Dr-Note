-- ============================================================================
-- Staff with `patients.read` (doctor/nurse/receptionist) can already read a
-- patient's `patient_profiles` and `emergency_contacts` rows, but the
-- `users_select` policy only allowed `users.manage` (admin) or self — so the
-- patient's name/email/phone were invisible to them. This blocks the patient
-- profile page (issue #22) for anyone but admin or the patient themselves.
-- Widen `users_select` to also allow `patients.read` when the target row
-- belongs to a user with the `patient` role, without exposing other staff
-- members' rows.
-- ============================================================================

drop policy if exists users_select on users;

create policy users_select on users for select
  using (
    has_permission('users.manage')
    or id = auth.uid()
    or (
      has_permission('patients.read')
      and exists (
        select 1
        from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = users.id and r.name = 'patient'
      )
    )
  );

-- Same gap on update: `patients.update` (admin + receptionist) must be able
-- to save a patient's name/phone on the profile page, not just
-- `patient_profiles`/`emergency_contacts`. Mirrors the select policy above.
drop policy if exists users_update on users;

create policy users_update on users for update
  using (
    has_permission('users.manage')
    or id = auth.uid()
    or (
      has_permission('patients.update')
      and exists (
        select 1
        from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = users.id and r.name = 'patient'
      )
    )
  );
