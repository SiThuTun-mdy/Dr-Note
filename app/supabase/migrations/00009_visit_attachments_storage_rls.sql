-- Migration: Add Storage RLS policies for visit-attachments bucket
-- Defense in depth: even if app-layer checks are bypassed, storage objects
-- cannot be accessed without a legitimate treatment relationship.
--
-- Path convention: visits/{visitId}/{timestamp}-{filename}
-- RLS joins back to the visits table to verify access.

-- Ensure RLS is enforced on storage.objects (default in newer Supabase, but safe)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- SELECT policy: staff with visits.read OR the patient who owns the visit
CREATE POLICY "visit_attachments_select"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'visit-attachments'
  AND (
    has_permission('visits.read')
    OR EXISTS (
      SELECT 1
      
      FROM visits v
      WHERE v.id::text = (storage.foldername(name))[2]
        AND v.patient_id = auth.uid()
    )
  )
);

-- INSERT policy: staff with visits.create (same as attachments_insert)
CREATE POLICY "visit_attachments_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'visit-attachments'
  AND has_permission('visits.create')
);

-- DELETE policy: staff with visits.update OR the original uploader
CREATE POLICY "visit_attachments_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'visit-attachments'
  AND (
    has_permission('visits.update')
    OR (storage.foldername(name))[2] = auth.uid()::text
  )
);
