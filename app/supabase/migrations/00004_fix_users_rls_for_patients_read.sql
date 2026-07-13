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
