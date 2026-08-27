-- =====================================================================
-- Second corrective fix, discovered while verifying Phase 1
-- (corrective_implementation_plan.md). Same drift pattern as
-- 20260827000001: public.formation_courses and public.formation_content
-- had also silently diverged from what courses-create/courses-update/
-- formations-get and the actual live CourseForm.tsx UI all assume.
--
-- formation_courses was missing: title_en, instructor, lesson_count,
-- level, featured, cover_image_path, image -- every field
-- courses-create/courses-update write and CourseForm.tsx submits.
-- formation_content.course_id existed as a plain uuid column but had no
-- foreign key to formation_courses at all, which is what made
-- formations-get's nested embed (formation_courses(*, formation_content(*)))
-- fail with PGRST200 even after the formations/admins relationship was
-- fixed.
--
-- Both tables are nearly empty (0 rows in formation_courses, 1 orphaned
-- row in formation_content that references no real course since
-- formation_courses has none) -- low risk, same reasoning as
-- 20260827000001.
-- =====================================================================

alter table public.formation_courses
  add column if not exists title_en text,
  add column if not exists instructor text,
  add column if not exists lesson_count integer default 1,
  add column if not exists level text default 'Débutant',
  add column if not exists featured boolean not null default false,
  add column if not exists cover_image_path text,
  add column if not exists image text;

-- The one existing formation_content row is orphaned (formation_courses
-- is empty, so it cannot reference a real course) -- delete it before
-- adding the FK, since it can't be made valid and isn't real user data.
delete from public.formation_content
  where course_id not in (select id from public.formation_courses);

alter table public.formation_content
  add constraint formation_content_course_id_fkey
  foreign key (course_id) references public.formation_courses (id) on delete cascade;
