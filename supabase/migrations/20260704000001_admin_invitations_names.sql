-- =====================================================================
-- Migration: Store invitee first/last name + phone on admin_invitations
-- so the admin-invite-accept flow can populate public.admins later.
-- =====================================================================

alter table public.admin_invitations
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;
