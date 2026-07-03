-- =====================================================================
-- Migration: Admin invitations & user notification preferences
-- =====================================================================

-- 1. Admin invitations
create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role_id uuid not null references public.roles (id),
  token text not null unique,
  status text not null default 'Pending',
  created_by uuid references public.admins (id),
  expires_at timestamptz not null,
  sent_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2. User notification preferences
create table public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'push')),
  category text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, channel, category)
);

-- Indexes
create index idx_admin_invitations_token on public.admin_invitations (token);
create index idx_admin_invitations_email on public.admin_invitations (email);
create index idx_user_notification_preferences_user on public.user_notification_preferences (user_id);

-- Triggers
create trigger trg_user_notification_preferences_updated_at before update on public.user_notification_preferences
  for each row execute function public.set_updated_at();

-- RLS
alter table public.admin_invitations enable row level security;
alter table public.user_notification_preferences enable row level security;

-- Admin invitations: super_admin manages all, admins can see their own invitations
create policy admin_invitations_select_admin on public.admin_invitations
  for select using (public.is_admin());
create policy admin_invitations_super_admin_all on public.admin_invitations
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

-- Notification preferences: users manage their own
create policy user_notification_preferences_select_own on public.user_notification_preferences
  for select using (user_id = auth.uid() or public.is_admin());
create policy user_notification_preferences_insert_own on public.user_notification_preferences
  for insert with check (user_id = auth.uid());
create policy user_notification_preferences_update_own on public.user_notification_preferences
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_notification_preferences_delete_own on public.user_notification_preferences
  for delete using (user_id = auth.uid());
