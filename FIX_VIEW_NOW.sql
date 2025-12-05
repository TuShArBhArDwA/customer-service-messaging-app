-- URGENT FIX: Recreate dashboard_messages view with assignment columns
-- Run this in Supabase SQL Editor to fix the "column does not exist" error

-- Step 1: Drop the old view
DROP VIEW IF EXISTS dashboard_messages CASCADE;

-- Step 2: Recreate the view WITH assignment columns
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

-- Step 3: Grant permissions so the app can access it
GRANT SELECT ON dashboard_messages TO authenticated;
GRANT SELECT ON dashboard_messages TO anon;
GRANT SELECT ON dashboard_messages TO service_role;

-- Step 4: Verify it works (optional - uncomment to test)
-- SELECT id, customer_name, assigned_agent_id, assigned_agent_name 
-- FROM dashboard_messages 
-- LIMIT 5;
