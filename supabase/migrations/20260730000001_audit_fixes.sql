-- =====================================================================
-- Audit fixes (2026-07-30)
--
-- 1. Drop the orphan parallel schema created by 20260619124236_initial_schema.
--    It defined a second, conflicting data model (members / tontine_groups /
--    tontine_join_requests / contribution_logs) that the application never
--    uses — the app is built entirely on the normalized schema
--    (users / accounts / transactions / tontines / tontine_members / ...).
--    These tables were also created WITHOUT row level security, so with the
--    default Supabase grants they were readable/writable by anyone holding
--    the anon key. Removing them eliminates both the confusion and the hole.
--
-- 2. Drop verification_codes. It backed a hand-rolled email-OTP flow that has
--    been removed (email confirmation is now disabled — members register
--    without any verification step). The table also had no RLS, so with the
--    default grants any client with the anon key could read every pending code
--    (account-takeover) or tamper with it. Dropping it removes both the dead
--    code path and the hole.
-- =====================================================================

-- 1. Drop orphan schema (empty + unused). cascade only affects this cluster.
drop table if exists public.contribution_logs cascade;
drop table if exists public.tontine_join_requests cascade;
drop table if exists public.tontine_groups cascade;
drop table if exists public.members cascade;

-- 2. Remove the dead OTP table.
drop table if exists public.verification_codes cascade;
