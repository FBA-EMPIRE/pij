-- =====================================================================
-- Migration: Investment module tables
-- =====================================================================

-- 1. Investment opportunities (marketplace listings)
create table public.investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  category text,
  description text,
  roi text,
  duration text,
  risk text not null default 'Modéré',
  min_amount numeric(14,2) not null default 0 check (min_amount >= 0),
  max_amount numeric(14,2) not null default 0 check (max_amount >= 0),
  goal numeric(14,2) not null default 0 check (goal >= 0),
  raised numeric(14,2) not null default 0 check (raised >= 0),
  status text not null default 'Draft',
  featured boolean not null default false,
  image text,
  created_by uuid references public.admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Investment portfolio (user's investments)
create table public.investment_portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  opportunity_id uuid references public.investment_opportunities (id) on delete set null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  current_value numeric(14,2) not null default 0 check (current_value >= 0),
  returns numeric(14,2) not null default 0,
  status text not null default 'Active',
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 3. Investment requests (approval workflow)
create table public.investment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  opportunity_id uuid references public.investment_opportunities (id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'Pending',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.admins (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_investment_portfolio_user on public.investment_portfolio (user_id);
create index idx_investment_requests_user on public.investment_requests (user_id);
create index idx_investment_requests_status on public.investment_requests (status);
create index idx_investment_opportunities_status on public.investment_opportunities (status);

-- Triggers
create trigger trg_investment_opportunities_updated_at before update on public.investment_opportunities
  for each row execute function public.set_updated_at();

-- RLS
alter table public.investment_opportunities enable row level security;
alter table public.investment_portfolio enable row level security;
alter table public.investment_requests enable row level security;

-- Opportunities: everyone can read published, admins manage all
create policy investment_opportunities_select_all on public.investment_opportunities
  for select using (true);
create policy investment_opportunities_admin_all on public.investment_opportunities
  for all using (public.is_admin()) with check (public.is_admin());

-- Portfolio: users see own, admins see all
create policy investment_portfolio_select_own on public.investment_portfolio
  for select using (user_id = auth.uid() or public.is_admin());
create policy investment_portfolio_insert_own on public.investment_portfolio
  for insert with check (user_id = auth.uid());
create policy investment_portfolio_admin_all on public.investment_portfolio
  for all using (public.is_admin()) with check (public.is_admin());

-- Requests: users see own, admins see all and manage
create policy investment_requests_select_own on public.investment_requests
  for select using (user_id = auth.uid() or public.is_admin());
create policy investment_requests_insert_own on public.investment_requests
  for insert with check (user_id = auth.uid());
create policy investment_requests_admin_update on public.investment_requests
  for update using (public.is_admin()) with check (public.is_admin());
