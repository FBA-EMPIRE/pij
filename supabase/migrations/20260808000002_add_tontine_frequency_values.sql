-- Add 'daily' and 'quarterly' cadences (Tontine Journalière, Tontine
-- d'urgence). Kept in its own migration, same as the earlier 'biweekly'
-- addition (20260702000001_enums_add_values.sql) -- a newly added enum
-- value can't be used by statements in the same transaction it was
-- added in, so any migration that uses these values must come after.
alter type public.tontine_frequency add value if not exists 'daily';
alter type public.tontine_frequency add value if not exists 'quarterly';
