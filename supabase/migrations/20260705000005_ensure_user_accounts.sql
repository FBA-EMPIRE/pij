-- =====================================================================
-- Fix: new users never got 'current'/'savings' rows in public.accounts,
-- so admin deposits/withdrawals failed with "Account not found for this
-- user and account type" (surfaced to the UI as a generic non-2xx error).
-- =====================================================================

-- 1. Update handle_new_user to also create the two account rows.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, uid, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'uid', 'PIJ-' || substr(new.id::text, 1, 8)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );

  insert into public.profiles (user_id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );

  insert into public.accounts (user_id, account_type)
  values (new.id, 'current'), (new.id, 'savings')
  on conflict (user_id, account_type) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- 2. Backfill accounts for existing users created before this fix.
insert into public.accounts (user_id, account_type)
select u.id, 'current'::account_type
from public.users u
where not exists (
  select 1 from public.accounts a
  where a.user_id = u.id and a.account_type = 'current'
);

insert into public.accounts (user_id, account_type)
select u.id, 'savings'::account_type
from public.users u
where not exists (
  select 1 from public.accounts a
  where a.user_id = u.id and a.account_type = 'savings'
);
