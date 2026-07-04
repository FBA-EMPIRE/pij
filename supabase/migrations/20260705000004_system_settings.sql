-- =====================================================================
-- Migration: Real persistence + enforcement for platform-wide settings
-- SystemMonitoring.tsx had "Maintenance Mode" and "Withdrawal Limit"
-- toggles that only changed local component state — nothing was ever
-- persisted or enforced. This gives them a real backing store.
-- =====================================================================

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.system_settings (key, value) values
  ('maintenance_mode', 'false'),
  ('withdrawal_limit', '500000')
on conflict (key) do nothing;

alter table public.system_settings enable row level security;

drop policy if exists system_settings_select_admin on public.system_settings;
create policy system_settings_select_admin on public.system_settings
  for select using (public.is_admin());

drop policy if exists system_settings_super_admin_manage on public.system_settings;
create policy system_settings_super_admin_manage on public.system_settings
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

create trigger trg_system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();
