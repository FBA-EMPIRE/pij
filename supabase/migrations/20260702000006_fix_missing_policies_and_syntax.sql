-- =====================================================================
-- Migration 6: Fix missing RLS policies
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. consultation_requests: add admin SELECT + UPDATE policies
--    (AdminFormations.tsx:29 reads all, AdminFormations schedules)
-- ---------------------------------------------------------------------
create policy consultation_requests_admin_select on public.consultation_requests
  for select using (public.is_admin());

create policy consultation_requests_admin_update on public.consultation_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 2. notifications: add admin UPDATE policy (mark all as read)
--    (AdminNotifications.tsx:59 updates all unread)
-- ---------------------------------------------------------------------
create policy notifications_admin_update on public.notifications
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. admins: allow regular admin to update own profile
--    (AdminProfile.tsx:48 updates own record, but only super_admin
--     had update access via admins_super_admin_manage)
-- ---------------------------------------------------------------------
create policy admins_update_own on public.admins
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- 4. formation_content_completions: DELETE for users + admin ALL
-- ---------------------------------------------------------------------
create policy formation_content_completions_delete_own on public.formation_content_completions
  for delete using (user_id = auth.uid());

create policy formation_content_completions_admin_all on public.formation_content_completions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. investment_requests: add explicit admin ALL policy
--    (covered by select_own for reads, but missing all for admin writes)
-- ---------------------------------------------------------------------
create policy investment_requests_admin_all on public.investment_requests
  for all using (public.is_admin()) with check (public.is_admin());
