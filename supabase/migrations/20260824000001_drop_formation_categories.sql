-- =====================================================================
-- Per spec 2.2: "L'option Formation remplace le concept de Category" --
-- a formation is already its own grouping, so the extra
-- formations -> formation_categories -> formation_courses hop is
-- redundant. Courses now hang directly off formations.
-- =====================================================================

alter table public.formation_courses
  add column formation_id uuid references public.formations (id) on delete cascade;

update public.formation_courses fc
  set formation_id = cat.formation_id
  from public.formation_categories cat
  where fc.category_id = cat.id;

alter table public.formation_courses
  alter column formation_id set not null;

drop index if exists idx_formation_courses_category;
create index idx_formation_courses_formation on public.formation_courses (formation_id);

alter table public.formation_courses
  drop column category_id;

drop table if exists public.formation_categories cascade;
