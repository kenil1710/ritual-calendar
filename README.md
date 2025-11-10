# Calendar Event Manager

A modern calendar event management application built with Next.js, TypeScript, and Supabase.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete calendar events
- **Admin Panel**: Direct access to admin panel via URL (no login UI)
- **Public Event Viewing**: Anyone can view events on the home page
- **Event Management**: Add new calendar events with title, description, date, and location
- **Edit Events**: Update existing events with a dedicated edit page
- **Delete Events**: Remove events with confirmation dialog
- **Recurring Events**: Support for recurring events (daily, weekly, monthly, yearly) with customizable intervals
- **Event Listing**: View all calendar events in a beautiful card layout with recurring event indicators
- **Real-time Data**: Powered by Supabase for reliable data storage
- **Simple Access**: Share admin URL directly with authorized administrators

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

**IMPORTANT**: You must create the database table before running the app!

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy and paste the contents of `supabase-setup-quick.sql` file (or use the SQL below)
6. Click **"Run"** button (or press `Ctrl+Enter`)

**Quick SQL Script:**
```sql
-- Create the table
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

-- Remove end_date column if it exists (for existing tables)
ALTER TABLE public.calendar_events DROP COLUMN IF EXISTS end_date;

-- Add recurring fields if they don't exist (for existing tables)
ALTER TABLE public.calendar_events 
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations" ON public.calendar_events;
CREATE POLICY "Allow all operations" ON public.calendar_events
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_is_recurring ON public.calendar_events(is_recurring);
```

**Detailed setup instructions are available in `SETUP_DATABASE.md`**

### 3. Set Up Database Security (Optional)

Since login UI is removed, access control is managed through:

1. **Supabase Row Level Security (RLS)**:
   - The database uses RLS policies to control access
   - Adjust RLS policies in Supabase Dashboard as needed
   - See `supabase-schema.sql` for current RLS setup

2. **Direct URL Access**:
   - Admin panel is accessible via: `http://localhost:3000/admin`
   - Share this URL with authorized administrators only
   - Consider adding additional security layers (API keys, IP whitelisting, etc.) for production

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqyawwvksizcfrzvqhdl.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
```

**Important**: Replace `your_supabase_anon_key_here` with your actual Supabase anonymous/public key from your Supabase project settings.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── admin/
│   │   ├── [id]/
│   │   │   └── page.tsx      # Edit event page (dynamic route, admin only)
│   │   └── page.tsx          # Admin panel for adding events (admin only)
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Event listing page (viewable by all)
│   └── globals.css           # Global styles
├── components/
│   ├── Navigation.tsx        # Navigation with auth buttons
│   └── ProtectedRoute.tsx    # Route protection component
├── contexts/
│   └── AuthContext.tsx       # Authentication context and provider
├── lib/
│   └── supabase.ts           # Supabase client configuration
└── package.json
```

## Usage

### Accessing the Application

1. **View Events**:
   - Navigate to the home page to view all events
   - No authentication required for viewing

2. **Admin Access**:
   - Access admin panel directly at: `/admin`
   - Share the admin URL with authorized administrators
   - No login UI - direct access via URL
   - For production, consider adding additional security (API keys, IP whitelisting, etc.)

### Viewing Events
- Navigate to the home page to see all calendar events in a card layout
- **Anyone can view events** (login not required for viewing)
- Events are sorted by date (ascending)
- Recurring events are marked with a badge

### Creating Events
1. Navigate to the Admin Panel (`/admin`) or click "Add New Event" button
2. Fill in the event form:
   - **Title** (required): Enter the event title
   - **Description** (optional): Add event description
   - **Date & Time** (required): Select the event date and time
   - **Location** (optional): Enter the event location
   - **Recurring Event**: Check the checkbox to make it recurring
     - Select recurrence type: Daily, Weekly, Monthly, or Yearly
     - Set the interval (e.g., every 2 weeks)
3. Click "Create Event" to save

### Editing Events
1. On the events listing page, click the "Edit" button on any event card
2. The edit page will load with the event details pre-filled
3. Modify any fields as needed
4. Click "Update Event" to save changes

### Deleting Events
1. On the events listing page, click the "Delete" button on any event card
2. Confirm the deletion in the confirmation dialog
3. The event will be permanently removed from the database

### Security Notes
- **Public Access**: Events are publicly viewable
- **Admin Access**: Admin panel is accessible via direct URL
- **Production Security**: For production deployments, consider adding:
  - API key authentication
  - IP whitelisting
  - Supabase RLS policies
  - Environment-based access control

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Supabase**: Backend as a service for database
- **Tailwind CSS**: Utility-first CSS framework
- **React DatePicker**: Date and time selection component

## Notes

- Make sure to set up Row Level Security policies in Supabase according to your security requirements
- The app uses the Supabase client-side library for direct database access
- All dates are stored in UTC and converted to local time for display

add