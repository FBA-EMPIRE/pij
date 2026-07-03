-- The tontine_members_select policy checked co-membership by querying
-- tontine_members from within its own USING clause. Postgres re-evaluates
-- the same RLS policy for that inner query, causing infinite recursion
-- ("infinite recursion detected in policy for relation tontine_members",
-- 42P17) on every read of this table.
--
-- Fix: move the co-membership check into a security definer function.
-- Like is_admin()/current_admin_role() above, it runs as the function
-- owner, which bypasses RLS on the inner lookup instead of re-entering
-- the calling policy.

create or replace function public.is_tontine_member(p_tontine_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.tontine_members tm
    where tm.tontine_id = p_tontine_id and tm.user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

drop policy if exists tontine_members_select on public.tontine_members;

create policy tontine_members_select on public.tontine_members
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_tontine_member(tontine_id)
  );
