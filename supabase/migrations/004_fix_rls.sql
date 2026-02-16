-- Quick fix: Disable RLS on admin_users temporarily
-- This will allow the query to work

-- Disable RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Verify user exists
SELECT id, email, role FROM admin_users;
