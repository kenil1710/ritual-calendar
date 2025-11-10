-- Creating Users in Supabase
-- 
-- IMPORTANT: Supabase doesn't allow creating users with passwords directly via SQL
-- for security reasons. You must use one of these methods:
--
-- METHOD 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Authentication → Users
-- 2. Click "Add User" or "Create New User"
-- 3. Enter email and password
-- 4. Check "Auto Confirm User"
-- 5. Click "Create User"
--
-- METHOD 2: Using Supabase Management API
-- Use the Management API with service role key (server-side only)
--
-- METHOD 3: Using Auth Admin Functions (if available)
-- Some Supabase instances have admin functions for user creation

-- View all users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- View specific user by email
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'user@example.com';

-- Delete a user (use with caution!)
-- DELETE FROM auth.users WHERE email = 'user@example.com';

-- Note: To create users, use the Supabase Dashboard or Management API
-- SQL does not support creating users with passwords for security reasons

