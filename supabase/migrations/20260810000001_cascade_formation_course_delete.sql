-- =====================================================================
-- formation_courses.category_id was originally ON DELETE SET NULL
-- (20260702000002_formation_tables.sql), so deleting a category
-- orphaned its courses instead of removing them. That breaks the
-- formations feature's requirement that deleting a formation removes
-- all of its categories, courses, and content -- verified live: after
-- this fix, deleting a formation correctly cascades all the way down
-- (formation -> category -> course -> content, the last leg already
-- being ON DELETE CASCADE from the same original migration).
--
-- Constraint name looked up dynamically since it was created inline
-- (auto-named by Postgres) rather than with an explicit name.
-- =====================================================================

do $$
declare
  r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.formation_courses'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%formation_categories%'
  loop
    execute format('alter table public.formation_courses drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.formation_courses
  add constraint formation_courses_category_id_fkey
  foreign key (category_id) references public.formation_categories (id) on delete cascade;
