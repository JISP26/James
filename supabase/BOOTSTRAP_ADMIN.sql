-- ============================================================================
-- Run this ONCE after you have created your first admin login in
-- Supabase Dashboard > Authentication > Users > Add User (email + password).
-- Replace the values below with that user's real id/email/name.
-- The id must match the auth.users.id (visible in the dashboard user list).
-- ============================================================================

insert into admin_users (id, full_name, email, role)
values (
  'REPLACE-WITH-AUTH-USER-UUID',
  'JISP Admin',
  'admin@jisp.com',
  'admin'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role;
