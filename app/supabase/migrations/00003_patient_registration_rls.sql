-- ============================================================================
-- Patient Registration RLS fix (issue #20)
-- Receptionists (permission `patients.create`) register patients, which
-- means inserting into `users` and `user_roles` (role = 'patient') — not
-- just `patient_profiles`. The original policies only allowed `users.manage`
-- (admin), which blocks the workflow described in
-- docs/guide/01-database-schema.md §7. This widens insert access without
-- letting receptionists grant staff roles.
-- ============================================================================

drop policy if exists users_insert on users;

create policy users_insert on users for insert
  with check (has_permission('users.manage') or has_permission('patients.create'));

drop policy if exists user_roles_insert on user_roles;

create policy user_roles_insert on user_roles for insert
  with check (
    has_permission('users.manage')
    or (
      has_permission('patients.create')
      and role_id = (select id from roles where name = 'patient')
    )
  );
