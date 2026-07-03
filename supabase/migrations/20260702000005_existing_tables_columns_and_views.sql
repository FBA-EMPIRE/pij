-- =====================================================================
-- Migration: Add missing columns to existing tables + balance view
-- =====================================================================

-- 1. profiles: add missing columns
alter table public.profiles
  add column if not exists profession text,
  add column if not exists profile_visibility text not null default 'members'
    check (profile_visibility in ('public', 'members', 'private'));

-- 2. users: add missing columns
alter table public.users
  add column if not exists two_factor_enabled boolean not null default false;

-- 3. users: add denormalized balance columns for frontend compatibility
alter table public.users
  add column if not exists balance_current numeric(14,2) not null default 0,
  add column if not exists balance_savings numeric(14,2) not null default 0,
  add column if not exists balance_investment numeric(14,2) not null default 0;

-- Trigger: sync balance columns from accounts table
create or replace function public.sync_user_balances()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set
    balance_current = coalesce((
      select balance from public.accounts
      where user_id = new.user_id and account_type = 'current'
      limit 1
    ), 0),
    balance_savings = coalesce((
      select balance from public.accounts
      where user_id = new.user_id and account_type = 'savings'
      limit 1
    ), 0),
    balance_investment = coalesce((
      select balance from public.accounts
      where user_id = new.user_id and account_type = 'investment'
      limit 1
    ), 0)
  where id = new.user_id;
  return new;
end;
$$;

create trigger trg_sync_user_balances_on_account_change
  after insert or update of balance, account_type on public.accounts
  for each row execute function public.sync_user_balances();

-- 4. tontine_types: add missing columns
alter table public.tontine_types
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists default_capacity integer not null default 10,
  add column if not exists status text not null default 'Active'
    check (status in ('Active', 'Inactive'));

-- 5. tontines: add missing columns
alter table public.tontines
  add column if not exists description text,
  add column if not exists contribution numeric(14,2) not null default 0,
  add column if not exists enrolled integer not null default 0,
  add column if not exists total_weeks integer not null default 0,
  add column if not exists current_week integer not null default 0,
  add column if not exists pool_amount numeric(14,2) not null default 0;

-- 6. savings_goals: add optional UI columns
alter table public.savings_goals
  add column if not exists icon text,
  add column if not exists color text;

-- 7. consultation_requests: add missing columns for admin scheduling
alter table public.consultation_requests
  add column if not exists consultant text,
  add column if not exists meeting_date timestamptz;

-- 8. user_balances view: unified balance view (flat schema compatibility)
create or replace view public.user_balances
with (security_invoker = true)
as
select
  u.id as user_id,
  u.email,
  u.balance_current,
  u.balance_savings,
  u.balance_investment,
  u.balance_current + u.balance_savings + u.balance_investment as balance_total
from public.users u;

-- 9. Initial sync: populate user balance columns from existing accounts data
update public.users u
set
  balance_current = coalesce((
    select balance from public.accounts a
    where a.user_id = u.id and a.account_type = 'current'
    limit 1
  ), 0),
  balance_savings = coalesce((
    select balance from public.accounts a
    where a.user_id = u.id and a.account_type = 'savings'
    limit 1
  ), 0),
  balance_investment = coalesce((
    select balance from public.accounts a
    where a.user_id = u.id and a.account_type = 'investment'
    limit 1
  ), 0);
