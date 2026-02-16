-- Quick Setup for Carmen Admin
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Create admin_users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_role CHECK (role IN ('admin', 'super_admin'))
);

-- Index for admin users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- RLS Policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view themselves
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users"
    ON admin_users FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Ensure user has super_admin role
UPDATE admin_users 
SET role = 'super_admin'
WHERE email = 'francois2botha@gmail.com';

-- Verify
SELECT id, email, role FROM admin_users WHERE email = 'francois2botha@gmail.com';
