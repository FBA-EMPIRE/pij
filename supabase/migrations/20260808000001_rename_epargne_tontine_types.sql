-- =====================================================================
-- The "Type de tontine" dropdown on the tontine creation page
-- (AdminTontines.tsx) renders tontine_types.name directly. Three of the
-- five seeded types are named "Épargne ..." (savings), which is
-- inconsistent branding for a tontine product -- rename to "Tontine ...",
-- matching the other two seeded types ("Tontine Famille", "Tontine
-- Affaires"). No component code references these names by string, so
-- this is a data-only fix.
-- =====================================================================

update public.tontine_types set name = 'Tontine Classique' where name = 'Épargne Classique';
update public.tontine_types set name = 'Tontine Premium' where name = 'Épargne Premium';
update public.tontine_types set name = 'Tontine Mensuelle' where name = 'Épargne Mensuelle';
