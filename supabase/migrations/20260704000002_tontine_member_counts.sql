-- =====================================================================
-- Migration: Public aggregate member counts for the tontine marketplace
-- tontine_members RLS only exposes rows to admins or existing members of
-- that tontine, so prospective members can't see fill level directly.
-- This function exposes only the aggregate count, not membership rows.
-- =====================================================================

create or replace function public.get_tontine_member_counts()
returns table (tontine_id uuid, member_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select tontine_id, count(*) as member_count
  from public.tontine_members
  where status = 'active'
  group by tontine_id;
$$;

grant execute on function public.get_tontine_member_counts() to anon, authenticated;
