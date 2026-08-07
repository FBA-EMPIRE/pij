-- =====================================================================
-- Fix: tontine participant list shows only the viewer's own name.
--
-- fetchTontineMembers() embeds users(...profiles(...)) through
-- tontine_members. tontine_members_select already lets a member see
-- co-members' rows in that table, but the embedded users/profiles rows
-- are independently RLS-checked, and users_select_own /
-- profiles_select_own only allow id = auth.uid() (or admin). So every
-- co-participant's embedded users/profiles row came back null, and the
-- UI fell back to "User" for everyone except the viewer.
--
-- Add narrow, additional (permissive) policies: a member may read the
-- users/profiles row of anyone they share at least one tontine with.
-- =====================================================================

create policy users_select_tontine_co_members on public.users
  for select using (
    exists (
      select 1 from public.tontine_members tm1
      join public.tontine_members tm2 on tm1.tontine_id = tm2.tontine_id
      where tm1.user_id = auth.uid() and tm2.user_id = users.id
    )
  );

create policy profiles_select_tontine_co_members on public.profiles
  for select using (
    exists (
      select 1 from public.tontine_members tm1
      join public.tontine_members tm2 on tm1.tontine_id = tm2.tontine_id
      where tm1.user_id = auth.uid() and tm2.user_id = profiles.user_id
    )
  );
