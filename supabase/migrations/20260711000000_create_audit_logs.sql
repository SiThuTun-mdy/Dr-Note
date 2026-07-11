-- Audit logs table for tracking sensitive operations
-- This table should have RLS enabled but be accessible for logging

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- System can insert audit logs (for server actions)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking sensitive operations';
COMMENT ON COLUMN audit_logs.user_id IS 'The user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'The action performed (e.g., patient.update)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource (e.g., patient, consultation)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the resource affected';
COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser user agent string';
