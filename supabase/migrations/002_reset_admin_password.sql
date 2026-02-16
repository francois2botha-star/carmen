-- Create/Reset Admin User: francois2botha@gmail.com
-- Password: 12345678

-- First, delete existing user if they exist (clean slate)
DELETE FROM admin_users WHERE email = 'francois2botha@gmail.com';
DELETE FROM auth.users WHERE email = 'francois2botha@gmail.com';

-- Create new user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'francois2botha@gmail.com',
  crypt('12345678', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Add to admin_users table
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'super_admin' 
FROM auth.users 
WHERE email = 'francois2botha@gmail.com';

-- Verify the setup
SELECT 
  u.id,
  u.email,
  u.role,
  u.email_confirmed_at,
  au.role as admin_role,
  CASE 
    WHEN u.encrypted_password IS NOT NULL THEN '✓ Password Set'
    ELSE '✗ No Password'
  END as password_status
FROM auth.users u
LEFT JOIN admin_users au ON au.id = u.id
WHERE u.email = 'francois2botha@gmail.com';

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Admin user created successfully!';
  RAISE NOTICE '📧 Email: francois2botha@gmail.com';
  RAISE NOTICE '🔑 Password: 12345678';
  RAISE NOTICE '🌐 Login at: /admin/login';
  RAISE NOTICE '';
END $$;
