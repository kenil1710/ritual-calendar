# Authentication Setup Guide

This guide will help you set up authentication and admin user management for the Calendar Event Manager.

## Step 1: Enable Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. Configure email settings if needed (for email confirmation)

## Step 2: Create User Roles Table

1. Go to **SQL Editor** in Supabase
2. Run the SQL from `supabase-auth-schema.sql` file:

```sql
-- Create user_roles table for managing admin users
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own role
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow all users to read roles (for admin checking)
CREATE POLICY "Allow all to read roles" ON user_roles
  FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
```

## Step 3: Create Your First Admin User

### Option A: Using SQL (Recommended)

1. Sign up a new user through the application (go to `/signup`)
2. Go to **SQL Editor** in Supabase
3. Run this SQL (replace the email with your user's email):

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Option B: Using Supabase Dashboard

1. Sign up a new user through the application
2. Go to **Authentication** → **Users** in Supabase Dashboard
3. Find the user you want to make admin
4. Click on the user to open user details
5. Scroll to **User Metadata** section
6. Click **Edit** and add:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **Save**

### Option C: Development Only (Temporary)

For quick testing, users with email ending in `@admin.com` will automatically be treated as admin.

**Note**: Remove this fallback in production!

## Step 4: Verify Admin Access

1. Log in with your admin account
2. You should see:
   - "Admin" badge next to your email in the navigation
   - "Admin Panel" link in the navigation
   - "Add New Event" button on the home page
   - "Edit" and "Delete" buttons on event cards

## Step 5: Test Non-Admin Access

1. Create a regular user account (not admin)
2. Log in with that account
3. You should see:
   - No "Admin" badge
   - No "Admin Panel" link
   - No "Add New Event" button
   - No "Edit" or "Delete" buttons on events
   - Can still view all events

## Troubleshooting

### User can't access admin panel

1. Check if the user is in the `user_roles` table:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'USER_ID_HERE';
   ```

2. Check user metadata:
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'user@example.com';
   ```

3. Verify the user_roles table exists and has the correct policies

### Can't sign up new users

1. Check if email provider is enabled in Supabase
2. Check if email confirmation is required (disable for testing)
3. Check Supabase logs for errors

### Admin check not working

1. Clear browser cache and cookies
2. Log out and log back in
3. Check browser console for errors
4. Verify the `user_roles` table exists and has data

## Security Notes

1. **Production Setup**: 
   - Remove the email-based admin fallback (`@admin.com`)
   - Use only the `user_roles` table for role management
   - Set up proper RLS policies for your use case

2. **RLS Policies**: 
   - The current setup allows all users to read roles (for admin checking)
   - You may want to restrict this further in production
   - Consider using Supabase's built-in RLS for more granular control

3. **Email Confirmation**:
   - For production, enable email confirmation
   - Configure email templates in Supabase
   - Test the email flow before going live

## Managing Multiple Admins

To add more admins, simply run the SQL query again with different email addresses:

```sql
-- Add multiple admins
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users 
WHERE email IN ('admin1@example.com', 'admin2@example.com', 'admin3@example.com')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Removing Admin Access

To remove admin access from a user:

```sql
DELETE FROM user_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

Or to change to regular user:

```sql
UPDATE user_roles 
SET role = 'user' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

