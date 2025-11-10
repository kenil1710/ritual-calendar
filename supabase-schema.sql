-- Create the calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create a new one
DROP POLICY IF EXISTS "Allow all operations" ON calendar_events;

-- Create a policy to allow all operations
-- NOTE: Adjust this policy based on your security requirements
-- For production, you may want to add authentication checks
CREATE POLICY "Allow all operations" ON calendar_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create an index on start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);

-- Create an index on is_recurring for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_is_recurring ON calendar_events(is_recurring);

