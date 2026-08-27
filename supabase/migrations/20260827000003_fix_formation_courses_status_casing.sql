-- =====================================================================
-- Third corrective fix, discovered while verifying 20260827000002: the
-- same status-casing drift already fixed on public.formations
-- (20260827000001) also exists on public.formation_courses -- the check
-- constraint only permits lowercase draft/published/archived, while
-- validateCourseCreate/validateCourseUpdate and every read path in this
-- codebase use Draft/Published/Archived. A course explicitly created
-- with status: "Draft" (the validator's own accepted value) would
-- currently fail this constraint outright. Table has 0 rows -- no data
-- migration needed.
-- =====================================================================

alter table public.formation_courses drop constraint formation_courses_status_check;
alter table public.formation_courses alter column status set default 'Draft';
update public.formation_courses set status = initcap(status); -- no-op today (table is empty)
alter table public.formation_courses
  add constraint formation_courses_status_check check (status in ('Draft', 'Published', 'Archived'));
