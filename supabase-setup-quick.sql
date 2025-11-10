-- Quick Setup SQL for Supabase
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Drop existing table if you need to recreate it (optional - remove if you have existing data)
-- DROP TABLE IF EXISTS public.calendar_events CASCADE;

-- Step 2: Create the table
CREATE TABLE IF NOT EXISTS public.calendar_events (
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

-- Step 3: If table already exists, alter it to add new columns and remove end_date
-- Remove end_date column if it exists
ALTER TABLE public.calendar_events DROP COLUMN IF EXISTS end_date;

-- Add recurring fields if they don't exist
ALTER TABLE public.calendar_events 
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

-- Add constraint for recurrence_type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'calendar_events_recurrence_type_check'
  ) THEN
    ALTER TABLE public.calendar_events 
    ADD CONSTRAINT calendar_events_recurrence_type_check 
    CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly') OR recurrence_type IS NULL);
  END IF;
END $$;

-- Step 4: Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Step 5: Remove existing policy if any
DROP POLICY IF EXISTS "Allow all operations" ON public.calendar_events;

-- Step 6: Create policy to allow all operations (for development)
-- WARNING: For production, use proper authentication checks
CREATE POLICY "Allow all operations" ON public.calendar_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_is_recurring ON public.calendar_events(is_recurring);

-- Verify the table was created (this will show an error if table doesn't exist, which is fine)
SELECT * FROM public.calendar_events LIMIT 1;

