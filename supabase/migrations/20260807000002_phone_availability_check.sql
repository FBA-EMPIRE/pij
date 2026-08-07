-- =====================================================================
-- Signup with an already-registered phone currently fails with an
-- opaque 500 ("{}") because the phone-uniqueness constraint lives on
-- public.users and is only enforced when handle_new_user's insert runs
-- inside the auth.users trigger transaction -- GoTrue surfaces that as
-- a generic gateway error, not a usable message.
--
-- Add a narrow security-definer RPC (same pattern as is_admin() /
-- current_admin_role()) so the signup form can check availability
-- before attempting signUp(), instead of relying on the DB constraint
-- to fail loudly. Returns only a boolean -- no row data -- to keep the
-- exposure to a plain existence check, callable pre-auth.
-- =====================================================================

create or replace function public.phone_is_registered(p_phone text)
returns boolean as $$
  select exists (select 1 from public.users where phone = p_phone);
$$ language sql stable security definer;

grant execute on function public.phone_is_registered(text) to anon, authenticated;
