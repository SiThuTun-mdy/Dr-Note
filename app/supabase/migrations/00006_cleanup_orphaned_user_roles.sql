-- ============================================================================
-- Cleanup orphaned user_roles entries
-- The seed data created user_roles entries for user IDs that don't exist
-- in the users table (e.g., a0000000-0000-0000-0000-000000000002).
-- This causes doctor search to fail because the doctor IDs from user_roles
-- don't match any real users.
-- ============================================================================

-- Delete user_roles entries where user_id does not exist in users table
DELETE FROM user_roles
WHERE user_id NOT IN (SELECT id FROM users);

-- Log how many rows were affected (optional, for verification)
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % orphaned user_roles entries', deleted_count;
END $$;
