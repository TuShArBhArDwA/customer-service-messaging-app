-- Create agent assignments table if it doesn't exist
-- This table tracks which agent has claimed/assigned messages
-- Run this script in Supabase SQL Editor if you get "table not found" errors

-- Drop table if exists (use only if you need to recreate it)
-- DROP TABLE IF EXISTS agent_assignments CASCADE;

CREATE TABLE IF NOT EXISTS agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'claimed' CHECK (status IN ('claimed', 'in_progress', 'resolved')),
  UNIQUE(message_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_assignments_message_id ON agent_assignments(message_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_agent_id ON agent_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_status ON agent_assignments(status);

-- Add comment for documentation
COMMENT ON TABLE agent_assignments IS 'Tracks which agent has claimed or assigned messages';

-- Enable RLS (Row Level Security) - optional, disabled for demo
-- ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Grant permissions (if using RLS, you'll need policies)
-- For now, using service role key bypasses RLS
