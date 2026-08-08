-- =====================================================================
-- Member-initiated deposit/withdrawal requests.
--
-- record-deposit/record-withdrawal are admin-only (getCallerAdmin) --
-- there is no payment gateway in this codebase to verify real money
-- movement before crediting a balance, so members can't be allowed to
-- move their own balance directly. This adds a request/approval layer
-- instead, matching the investment_requests pattern already used
-- elsewhere: the member submits a request (direct client insert, RLS
-- scoped to their own row), and an admin actually moves money via a
-- new Edge Function that performs the same balance update
-- record-deposit/record-withdrawal do.
-- =====================================================================

create table public.transaction_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal')),
  account_type text not null check (account_type in ('savings', 'current')),
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.admins (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_transaction_requests_user on public.transaction_requests (user_id);
create index idx_transaction_requests_status on public.transaction_requests (status);

alter table public.transaction_requests enable row level security;

create policy transaction_requests_select_own on public.transaction_requests
  for select using (user_id = auth.uid() or public.is_admin());

create policy transaction_requests_insert_own on public.transaction_requests
  for insert with check (user_id = auth.uid());

create policy transaction_requests_admin_update on public.transaction_requests
  for update using (public.is_admin()) with check (public.is_admin());
