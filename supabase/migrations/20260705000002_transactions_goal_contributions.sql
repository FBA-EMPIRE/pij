-- =====================================================================
-- Migration: Support member self-service savings-goal contributions
--
-- transactions.recorded_by was NOT NULL and referenced public.admins,
-- which made it structurally impossible for a member to ever record
-- their own transaction (only admins could be the recorder). Member-side
-- contribution flows need recorded_by to be nullable (null = member
-- self-service), and a goal_id link so contributions can be tied back
-- to the savings goal they were made towards.
-- =====================================================================

alter table public.transactions
  alter column recorded_by drop not null;

alter table public.transactions
  add column if not exists goal_id uuid references public.savings_goals (id) on delete set null;

create index if not exists idx_transactions_goal on public.transactions (goal_id);
