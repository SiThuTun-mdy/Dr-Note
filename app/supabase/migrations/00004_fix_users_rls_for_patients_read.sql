-- Fix RLS policy on users table to allow doctors/nurses to read patient names
-- The existing policy only allows users.manage or own record
-- Doctors need patients.read permission to view patient names in consult view

-- Drop the existing select policy
DROP POLICY IF EXISTS users_select ON users;

-- Create updated policy that includes patients.read permission
CREATE POLICY users_select ON users FOR SELECT
  USING (
    has_permission('users.manage')
    OR has_permission('patients.read')
    OR id = auth.uid()
  );

-- Fix screenings RLS to allow doctors to view vitals during consultation
-- Existing policy only allows nurses (screenings.create) or the patient themselves
DROP POLICY IF EXISTS screenings_select ON screenings;

CREATE POLICY screenings_select ON screenings FOR SELECT
  USING (
    has_permission('screenings.create')
    OR has_permission('visits.read')
    OR exists (
      select 1 from visits where visits.id = screenings.visit_id and visits.patient_id = auth.uid()
    )
  );

-- Fix visit_diagnoses insert to also allow visits.read (doctors need to add diagnoses)
-- Existing policy only allows diagnoses.assign
DROP POLICY IF EXISTS visit_diagnoses_insert ON visit_diagnoses;

CREATE POLICY visit_diagnoses_insert ON visit_diagnoses FOR INSERT
  WITH CHECK (
    has_permission('diagnoses.assign')
    OR has_permission('visits.read')
  );
