# Database Setup Instructions

Follow these steps to create the `calendar_events` table in your Supabase database:

## Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project (the one with URL: `zqyawwvksizcfrzvqhdl.supabase.co`)

## Step 2: Open SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click on **"New query"** button

## Step 3: Run the SQL Script

1. Copy the entire contents of the `supabase-schema.sql` file
2. Paste it into the SQL Editor
3. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

Alternatively, you can copy and paste this SQL directly:

```sql
-- Create the calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  country TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remove end_date column if it exists (for existing tables)
ALTER TABLE calendar_events DROP COLUMN IF EXISTS end_date;

-- Add recurring fields if they don't exist (for existing tables)
ALTER TABLE calendar_events 
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create a new one
DROP POLICY IF EXISTS "Allow all operations" ON calendar_events;

-- Create a policy to allow all operations
CREATE POLICY "Allow all operations" ON calendar_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_is_recurring ON calendar_events(is_recurring);
```

## Step 4: Verify Table Creation

1. In the left sidebar, click on **"Table Editor"**
2. You should see `calendar_events` table in the list
3. Click on it to verify the columns are created correctly

## Step 5: Verify RLS Policy

1. In the left sidebar, click on **"Authentication"** → **"Policies"**
2. Or go to **"Table Editor"** → click on `calendar_events` → **"Policies"** tab
3. You should see the "Allow all operations" policy

## Troubleshooting

### If you get a "policy already exists" error:
- The SQL script now includes `DROP POLICY IF EXISTS` to handle this
- If you still get errors, manually delete the existing policy first

### If the table still doesn't appear:
1. Refresh the Supabase dashboard
2. Check the SQL Editor for any error messages
3. Make sure you're in the correct project/database

### If you get permission errors:
1. Make sure you're using the correct Supabase project
2. Check that your API key has the correct permissions
3. Verify Row Level Security policies are set up correctly

## Quick Test

After setting up the table, you can test it by:

1. Going to your app: `http://localhost:3000/admin`
2. Adding a test event
3. Checking if it appears on the home page

If everything is set up correctly, you should be able to create and view events without any errors!

