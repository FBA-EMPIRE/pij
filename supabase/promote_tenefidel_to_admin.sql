-- ============================================================
-- ADMIN PROMOTION SCRIPT
-- Target: tenefidel2018@gmail.com
-- ============================================================
-- HOW TO USE:
--   1. Open Supabase Dashboard -> SQL Editor (project ktyzbrrbukpzrcokdmpu)
--   2. Paste and run this script
--   3. Ask the user to log out and log back in, then navigate to /admin/dashboard
--
-- IMPORTANT: this script derives the id from auth.users by email. The admins
-- row MUST use the auth.users.id, because getCallerAdmin looks up
-- admins.id = <JWT sub> (the auth user id). Do NOT hardcode a public.users id
-- or any other UUID here -- if it differs from the auth id the login token
-- will never match and every admin action fails with "Not an active admin".
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_user_email text := 'tenefidel2018@gmail.com';
  v_super_admin_role_id uuid;
begin
  -- Always resolve the id from Supabase Auth (this is the JWT sub used at login)
  select id into v_user_id from auth.users where email = v_user_email;
  if v_user_id is null then
    raise exception 'User % not found in auth.users. They must sign up first.', v_user_email;
  end if;

  -- Ensure user exists in public.users (id must equal the auth id)
  insert into public.users (id, uid, email, status)
  values (
    v_user_id,
    'PIJ-' || substr(replace(v_user_id::text, '-', ''), 1, 8),
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

  -- Insert/update admins row keyed on the auth id
  insert into public.admins (id, role_id, first_name, last_name, email, is_active, mfa_enabled)
  values (
    v_user_id,
    v_super_admin_role_id,
    'Fidel',
    'Tene',
    v_user_email,
    true,
    false
  )
  on conflict (id) do update set
    role_id = v_super_admin_role_id,
    is_active = true;

  raise notice 'SUCCESS: User % (auth id %) has been promoted to super_admin!', v_user_email, v_user_id;
end;
$$;
