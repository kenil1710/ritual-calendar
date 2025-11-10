# Creating Users via SQL

Since signup is disabled, users must be created manually via SQL in Supabase. This allows for controlled access - only users you explicitly create can log in.

## Method 1: Using Supabase Auth Admin API (Recommended)

The easiest way is to use Supabase's built-in user creation through the Dashboard:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Create New User"**
3. Fill in:
   - **Email**: User's email address
   - **Password**: Temporary password (user should change this)
   - **Auto Confirm User**: Check this box to skip email confirmation
4. Click **"Create User"**
5. Share the credentials with the user

## Method 2: Using SQL (Advanced)

You can also create users directly using SQL. However, Supabase doesn't provide a simple SQL function to create users with passwords for security reasons.

### Option A: Using Supabase Dashboard (Easier)

Use the Dashboard method above - it's the recommended approach.

### Option B: Using Supabase Management API

If you need to create users programmatically, you'll need to use the Supabase Management API with a service role key (keep this secure!).

**Note**: The Management API requires server-side code and should not be exposed in client-side applications.

## Method 3: Manual User Creation via Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Authentication** → **Users**

2. **Create New User**
   - Click **"Add User"** or **"Invite User"**
   - Enter the user's email address
   - Set a temporary password
   - Check **"Auto Confirm User"** (so they don't need email confirmation)
   - Click **"Create User"**

3. **Share Credentials**
   - Share the email and temporary password with the user
   - They can log in and change their password if needed

## User Management

### Viewing All Users

```sql
-- View all users in the auth.users table
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### Deleting a User

**Via Dashboard:**
1. Go to Authentication → Users
2. Find the user
3. Click the delete button
4. Confirm deletion

**Via SQL:**
```sql
-- Delete a user by email (use with caution!)
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### Resetting a User's Password

**Via Dashboard:**
1. Go to Authentication → Users
2. Find the user
3. Click on the user
4. Click "Reset Password"
5. User will receive an email to reset their password

### Disabling a User (Without Deleting)

You can't directly disable users via SQL easily, but you can:
1. Change their password to a random string
2. Or delete and recreate when needed

## Security Best Practices

1. **Use Strong Passwords**: When creating users, use strong, unique passwords
2. **Enable Email Confirmation**: For production, enable email confirmation
3. **Rotate Passwords**: Encourage users to change their passwords after first login
4. **Monitor Access**: Regularly check the `auth.users` table for suspicious activity
5. **Limit Access**: Only create accounts for users who need access

## Example: Creating Multiple Users

If you need to create multiple users, use the Dashboard to create them one by one, or use a script with the Management API.

**Note**: Bulk user creation should be done carefully and securely.

## Troubleshooting

### User Can't Log In

1. Check if the user exists:
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

2. Check if email is confirmed:
   ```sql
   SELECT email, email_confirmed_at FROM auth.users WHERE email = 'user@example.com';
   ```

3. If email is not confirmed, either:
   - Enable "Auto Confirm User" when creating
   - Or manually confirm via Dashboard

### User Forgot Password

1. Go to Authentication → Users
2. Find the user
3. Click "Reset Password"
4. User will receive a password reset email

## Access Control

Remember: All users who can log in automatically have admin access to manage events. Only create accounts for users who should have full access to create, edit, and delete events.

## Next Steps

After creating a user:
1. Share the credentials with the user
2. User logs in at `/login`
3. User automatically has admin access
4. User can create, edit, and delete events

