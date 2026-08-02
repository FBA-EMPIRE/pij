-- ============================================================
-- ADMIN PROMOTION SCRIPT
-- Target: tenefidel2018@gmail.com (id 4f0fb5e4-6bf6-4919-b670-8f8f74b90f3e)
-- ============================================================
-- HOW TO USE:
--   1. Open Supabase Dashboard -> SQL Editor (project ktyzbrrbukpzrcokdmpu)
--   2. Paste and run this script
--   3. Ask the user to log out and log back in, then navigate to /admin/dashboard
-- ============================================================

do $$
declare
  v_user_id uuid := '4f0fb5e4-6bf6-4919-b670-8f8f74b90f3e';
  v_user_email text := 'tenefidel2018@gmail.com';
  v_super_admin_role_id uuid;
begin
  -- Sanity check: user must already exist in Supabase Auth
  if not exists (select 1 from auth.users where id = v_user_id) then
    raise exception 'User id % not found in auth.users. They must sign up first.', v_user_id;
  end if;

  -- Ensure user exists in public.users (should already, per the provided row)
  insert into public.users (id, uid, email, phone, status, kyc_status)
  values (
    v_user_id,
    'PIJ-4f0fb5e4',
    v_user_email,
    '+237656473358',
    'pending',
    'approved'
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

  -- Insert/update admins row
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
end;
$$;
