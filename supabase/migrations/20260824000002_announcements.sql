-- =====================================================================
-- Announcements feature (modifications doc section 2.6). Authors are
-- always admins-table members (admin/super_admin/formateur) -- there is
-- no separate "trainer_id" column anywhere; formation ownership is
-- formations.created_by, reused here for the trainer-can-only-announce-
-- their-own-formations check enforced in the Edge Functions.
-- reference_id is a plain uuid (no FK): it points at formations, tontine
-- types, or investment rows depending on `type`, so it can't carry a
-- single foreign key.
-- =====================================================================

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('formation', 'tontine', 'investment', 'general')),
  reference_id uuid,
  author_id uuid not null references public.admins (id) on delete cascade,
  author_type text not null,
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_announcements_active_published on public.announcements (is_active, published_at desc);
create index idx_announcements_type on public.announcements (type);
create index idx_announcements_author on public.announcements (author_id);

create trigger trg_announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

-- Anyone (including anonymous) can read active, non-expired announcements.
create policy announcements_read_active on public.announcements
  for select using (is_active = true and (expires_at is null or expires_at > now()));

-- Admins/super_admins/formateurs (is_admin() covers every admins row
-- regardless of role) can manage announcements directly; the Edge
-- Functions still enforce the finer-grained trainer-owns-formation rule
-- since RLS alone can't express that per-row check against formations.
create policy announcements_admin_all on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());
