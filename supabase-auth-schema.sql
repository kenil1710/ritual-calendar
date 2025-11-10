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
-- Adjust this based on your security requirements
CREATE POLICY "Allow all to read roles" ON user_roles
  FOR SELECT
  USING (true);

-- Create policy to allow admins to manage roles
-- Note: This requires a function to check if the current user is an admin
-- For now, we'll allow authenticated users to insert their own role
-- You may want to restrict this further in production

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create an index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To make a user an admin, run this SQL (replace USER_ID with the actual user ID):
-- INSERT INTO user_roles (user_id, role) VALUES ('USER_ID', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

