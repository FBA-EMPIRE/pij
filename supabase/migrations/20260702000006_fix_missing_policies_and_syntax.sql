-- =====================================================================
-- Migration 6: Fix missing RLS policies
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. consultation_requests: add admin SELECT + UPDATE policies
--    (AdminFormations.tsx:29 reads all, AdminFormations schedules)
-- ---------------------------------------------------------------------
drop policy if exists consultation_requests_admin_select on public.consultation_requests;
create policy consultation_requests_admin_select on public.consultation_requests
  for select using (public.is_admin());

drop policy if exists consultation_requests_admin_update on public.consultation_requests;
create policy consultation_requests_admin_update on public.consultation_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 2. notifications: add admin UPDATE policy (mark all as read)
--    (AdminNotifications.tsx:59 updates all unread)
-- ---------------------------------------------------------------------
drop policy if exists notifications_admin_update on public.notifications;
create policy notifications_admin_update on public.notifications
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. admins: allow regular admin to update own profile
--    (AdminProfile.tsx:48 updates own record, but only super_admin
--     had update access via admins_super_admin_manage)
-- ---------------------------------------------------------------------
drop policy if exists admins_update_own on public.admins;
create policy admins_update_own on public.admins
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- 4. formation_content_completions: DELETE for users + admin ALL
-- ---------------------------------------------------------------------
drop policy if exists formation_content_completions_delete_own on public.formation_content_completions;
create policy formation_content_completions_delete_own on public.formation_content_completions
  for delete using (user_id = auth.uid());

drop policy if exists formation_content_completions_admin_all on public.formation_content_completions;
create policy formation_content_completions_admin_all on public.formation_content_completions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. investment_requests: add explicit admin ALL policy
--    (covered by select_own for reads, but missing all for admin writes)
-- ---------------------------------------------------------------------
drop policy if exists investment_requests_admin_all on public.investment_requests;
create policy investment_requests_admin_all on public.investment_requests
  for all using (public.is_admin()) with check (public.is_admin());
