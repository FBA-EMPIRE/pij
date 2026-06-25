-- =====================================================================
-- Migration 13: Handle phone in signup trigger + allow user insert
-- =====================================================================

-- 1. Update handle_new_user to also store phone from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, uid, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'uid', 'UID-' || substr(new.id::text, 1, 8)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );

  insert into public.profiles (user_id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );

  return new;
end;
$$ language plpgsql security definer;

-- 2. Allow users to insert their own row (the trigger handles actual creation,
--    but this covers any edge case where client-side insert is needed)
create policy users_insert_own on public.users
  for insert with check (id = auth.uid());

-- 3. Allow users to insert their own profile (same reasoning)
create policy profiles_insert_own on public.profiles
  for insert with check (user_id = auth.uid());
