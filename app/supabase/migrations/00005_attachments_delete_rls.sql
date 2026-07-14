-- Migration: Add RLS DELETE policy for attachments table
-- The initial schema only had SELECT and INSERT policies.
-- This adds DELETE to allow doctors/nurses to remove attachments from visits they have access to.

-- Enable RLS (already enabled, but safe to call)
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- DELETE policy: allow staff with visits.update permission or the original uploader
CREATE POLICY attachments_delete ON attachments
  FOR DELETE
  USING (
    has_permission('visits.update')
    OR uploaded_by = auth.uid()
  );
