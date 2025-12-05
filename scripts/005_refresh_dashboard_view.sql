-- Refresh dashboard_messages view to ensure it picks up latest assignments
-- This script ensures the view is correctly joining with agent_assignments table
-- 
-- IMPORTANT: Run this if you get "column dashboard_messages.assigned_agent_id does not exist" error
-- The view was likely created before the agent_assignments table existed

-- Drop and recreate the view to ensure it's up to date
DROP VIEW IF EXISTS dashboard_messages CASCADE;

-- Recreate the view with proper assignment join
CREATE VIEW dashboard_messages AS
SELECT
  m.id,
  m.content,
  m.message_type,
  m.urgency_score,
  m.created_at,
  m.agent_id,
  c.id as customer_id,
  c.email as customer_email,
  c.name as customer_name,
  cp.loan_status,
  cp.account_status,
  aa.agent_id as assigned_agent_id,
  aa.agent_name as assigned_agent_name,
  aa.status as assignment_status,
  aa.assigned_at,
  COUNT(*) OVER (PARTITION BY c.id) as customer_message_count
FROM messages m
JOIN customers c ON m.customer_id = c.id
LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
LEFT JOIN agent_assignments aa ON m.id = aa.message_id
WHERE m.message_type = 'customer';

-- Grant permissions
GRANT SELECT ON dashboard_messages TO authenticated;
GRANT SELECT ON dashboard_messages TO anon;
GRANT SELECT ON dashboard_messages TO service_role;

-- Verify the view works by checking a sample (uncomment to test)
-- SELECT id, customer_name, assigned_agent_id, assigned_agent_name 
-- FROM dashboard_messages 
-- WHERE assigned_agent_id IS NOT NULL
-- LIMIT 5;
