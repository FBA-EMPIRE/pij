-- =====================================================================
-- Tontine type name/cadence changes.
--
-- Note: existing tontines reference tontine_types by type_id (a plain
-- FK), not by name -- these are in-place UPDATEs to the same rows, so
-- every tontine already created from these types picks up the new
-- name/frequency automatically the next time it's displayed (all reads
-- join tontine_types live). Nothing else needs migrating.
-- =====================================================================

-- tontine_types.frequency had its own, narrower check constraint than
-- the tontine_frequency enum (only weekly/monthly). Widen it to admit
-- the two new cadences. Constraint name is looked up dynamically since
-- it was originally created inline (auto-named by Postgres) rather
-- than with an explicit name.
do $$
declare
  r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.tontine_types'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%frequency%'
  loop
    execute format('alter table public.tontine_types drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.tontine_types
  add constraint tontine_types_frequency_check
  check (frequency in ('weekly', 'monthly', 'daily', 'quarterly'));

-- Renames
update public.tontine_types set name = 'Tontine Millions' where name = 'Tontine Affaires';

update public.tontine_types
  set name = 'Tontine d''urgence (25 000/trimestre)',
      frequency = 'quarterly',
      description = 'Tontine d''urgence, cotisation trimestrielle'
  where name = 'Tontine Mensuelle';

-- New types
insert into public.tontine_types (name, description, contribution_amount, frequency) values
  ('Tontine Scolaire', 'Tontine pour les frais scolaires', 10000, 'monthly'),
  ('Tontine Journalière', 'Tontine quotidienne', 500, 'daily')
on conflict do nothing;
