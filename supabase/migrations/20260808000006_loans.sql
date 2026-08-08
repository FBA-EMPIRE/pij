-- =====================================================================
-- Loan & Financing module -- a member-facing loan ledger. This does
-- NOT move real balances (no accounts/transactions interaction): the
-- task's own column list has no status/approval field, just amount,
-- interest, dates, a free-text result, and an is_repaid flag, so this
-- is scoped as a tracking record, not a disbursement/collection system.
-- =====================================================================

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  interest numeric(6,2) not null default 0 check (interest >= 0),
  loan_date date not null,
  repayment_date date not null,
  is_repaid boolean not null default false,
  result text,
  created_at timestamptz not null default now()
);

create index idx_loans_user on public.loans (user_id);

alter table public.loans enable row level security;

create policy loans_select_own on public.loans
  for select using (user_id = auth.uid() or public.is_admin());

create policy loans_insert_own on public.loans
  for insert with check (user_id = auth.uid());

create policy loans_update_own on public.loans
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
