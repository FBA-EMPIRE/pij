-- ============================================================
-- ADMIN PROMOTION SCRIPT
-- ============================================================
-- HOW TO USE:
--   1. Register a new account via the app (Login page → Sign up)
--   2. Replace 'your-email@example.com' below with your email
--   3. Open your Supabase Dashboard → SQL Editor
--   4. Paste and run this script
--   5. Log out and log back in, then navigate to /admin/dashboard
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_super_admin_role_id uuid;
  v_user_email text := 'tontinepij@gmail.com';
begin
  -- Get the user ID from Supabase Auth
  select id into v_user_id
  from auth.users
  where email = v_user_email;

  if v_user_id is null then
    raise exception 'User with email % not found in auth.users. Did you register first?', v_user_email;
  end if;

  -- Ensure user exists in public.users
  insert into public.users (id, uid, email, status)
  values (
    v_user_id,
    'ADM-' || substr(replace(v_user_id::text, '-', ''), 1, 12),
    v_user_email,
    'active'
  )
  on conflict (id) do nothing;

  -- Get super_admin role ID
  select id into v_super_admin_role_id
  from public.roles
  where name = 'super_admin';

  if v_super_admin_role_id is null then
    raise notice 'super_admin role not found. Run the seed migration first (npx supabase migration up).';
    return;
  end if;

  -- Insert into admins
  insert into public.admins (id, role_id, first_name, last_name, email, is_active, mfa_enabled)
  values (
    v_user_id,
    v_super_admin_role_id,
    'Admin',
    'User',
    v_user_email,
    true,
    false
  )
  on conflict (id) do update set
    role_id = v_super_admin_role_id,
    is_active = true;

  raise notice 'SUCCESS: User % has been promoted to super_admin!', v_user_email;
  raise notice 'Log out and log back in, then go to /admin/dashboard';
end;
$$;
