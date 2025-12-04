-- Create a view for agent dashboard with key metrics
CREATE OR REPLACE VIEW dashboard_messages AS
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
  COUNT(*) OVER (PARTITION BY c.id) as customer_message_count
FROM messages m
JOIN customers c ON m.customer_id = c.id
LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
WHERE m.message_type = 'customer'
ORDER BY m.urgency_score DESC, m.created_at DESC;

-- Create a view for customer conversations
CREATE OR REPLACE VIEW customer_conversations AS
SELECT
  c.id as customer_id,
  c.email,
  c.name,
  cp.loan_status,
  cp.account_status,
  COUNT(CASE WHEN m.message_type = 'customer' THEN 1 END) as unread_customer_messages,
  MAX(CASE WHEN m.message_type = 'customer' THEN m.created_at END) as last_customer_message_at,
  MAX(CASE WHEN m.message_type = 'agent' THEN m.created_at END) as last_agent_message_at,
  MAX(m.urgency_score) as max_urgency
FROM customers c
LEFT JOIN messages m ON c.id = m.customer_id
LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
GROUP BY c.id, c.email, c.name, cp.loan_status, cp.account_status
ORDER BY max_urgency DESC, last_customer_message_at DESC;
