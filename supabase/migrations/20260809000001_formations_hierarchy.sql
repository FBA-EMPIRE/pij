-- =====================================================================
-- Add a top-level "formations" grouping entity above the existing flat
-- formation_categories -> formation_courses -> formation_content chain,
-- so multiple distinct training programs can each have their own set
-- of categories/courses/content instead of sharing one global catalog.
--
-- Existing tables are extended (formation_id added), not recreated --
-- formation_categories/formation_courses already exist with real data
-- and are read by both AdminFormations.tsx and the member-facing
-- Formations.tsx; a plain CREATE TABLE with those names would fail
-- outright (relation already exists).
-- =====================================================================

create table public.formations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  description text,
  description_en text,
  cover_image text,
  status text not null default 'Draft' check (status in ('Draft', 'Published', 'Archived')),
  created_by uuid references public.admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_formations_updated_at before update on public.formations
  for each row execute function public.set_updated_at();

alter table public.formations enable row level security;

create policy formations_read_all on public.formations
  for select using (true);
create policy formations_admin_all on public.formations
  for all using (public.is_admin()) with check (public.is_admin());

-- Backfill: existing categories need to belong to *some* formation
-- before formation_id can be required.
insert into public.formations (title, title_en, description, status)
values ('Formation générale', 'General Formation', 'Catégories créées avant l''introduction des formations.', 'Published');

alter table public.formation_categories
  add column formation_id uuid references public.formations (id) on delete cascade;

update public.formation_categories
  set formation_id = (select id from public.formations where title = 'Formation générale')
  where formation_id is null;

alter table public.formation_categories
  alter column formation_id set not null;

create index idx_formation_categories_formation on public.formation_categories (formation_id);

-- Consultations can be requested against a formation directly, not only
-- a specific course -- nullable, since existing rows and the member
-- flow (which links a course, not a formation) don't set it.
alter table public.consultation_requests
  add column formation_id uuid references public.formations (id) on delete set null;

create index idx_consultation_requests_formation on public.consultation_requests (formation_id);

-- Admin-facing notes, separate from the member's own "need" text.
alter table public.consultation_requests
  add column admin_notes text;
