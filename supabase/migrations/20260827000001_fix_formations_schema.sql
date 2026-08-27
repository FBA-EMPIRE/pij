-- =====================================================================
-- Corrective fix (corrective_implementation_plan.md, Phase 1).
--
-- The live public.formations table had drifted from what every piece of
-- application code (Edge Functions, _shared/role-check.ts) and the
-- original 20260809000001_formations_hierarchy.sql migration assume:
-- it had a NOT NULL trainer_id column (FK -> users) instead of
-- created_by (FK -> admins), was missing title_en/description_en
-- entirely, and its status check constraint enforced lowercase
-- draft/published/archived while all application code uses
-- Draft/Published/Archived. This is why formations-list/-get/-create
-- and every trainer-ownership check were failing with a generic
-- "Internal server error". The table is empty (0 rows) at the time of
-- this migration, so this is a pure schema correction, no data to lose.
-- =====================================================================

alter table public.formations rename column trainer_id to created_by;
alter table public.formations drop constraint formations_trainer_id_fkey;
alter table public.formations
  add constraint formations_created_by_fkey foreign key (created_by) references public.admins (id);
alter table public.formations alter column created_by drop not null;

alter table public.formations add column title_en text;
alter table public.formations add column description_en text;

alter table public.formations drop constraint formations_status_check;
alter table public.formations alter column status set default 'Draft';

-- No-op today (table is empty) -- safety net in case any row exists by
-- the time this runs, so a lowercase legacy value doesn't violate the
-- new constraint added right after. Must run before the constraint is
-- added, not after, or an existing lowercase row would fail validation.
update public.formations set status = initcap(status);

alter table public.formations
  add constraint formations_status_check check (status in ('Draft', 'Published', 'Archived'));
