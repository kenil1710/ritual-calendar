import { createClient } from '@supabase/supabase-js'

// For client-side usage in Next.js, we need NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zqyawwvksizcfrzvqhdl.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''

if (!supabaseKey) {
  console.error('Missing Supabase key. Please set NEXT_PUBLIC_SUPABASE_KEY in your .env.local file.')
  // Don't throw in browser to allow the app to load, but operations will fail
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface CalendarEvent {
  id?: string
  title: string
  description?: string
  start_date: string
  location?: string
  is_recurring?: boolean
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  recurrence_interval?: number | null
  created_at?: string
  updated_at?: string
}

