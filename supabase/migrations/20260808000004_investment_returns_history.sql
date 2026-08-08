-- =====================================================================
-- Log each investment-distribute-return event so the portfolio page can
-- show returns history, not just the running total on
-- investment_portfolio.returns.
-- =====================================================================

create table public.investment_returns_history (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.investment_portfolio (id) on delete cascade,
  amount numeric(14,2) not null,
  distributed_at timestamptz not null default now(),
  notes text
);

create index idx_investment_returns_history_portfolio on public.investment_returns_history (portfolio_id);

alter table public.investment_returns_history enable row level security;

-- Same ownership pattern as investment_portfolio_select_own, resolved
-- through the parent portfolio row since this table has no user_id of
-- its own.
create policy investment_returns_history_select_own on public.investment_returns_history
  for select using (
    exists (
      select 1 from public.investment_portfolio p
      where p.id = investment_returns_history.portfolio_id
        and (p.user_id = auth.uid() or public.is_admin())
    )
  );

create policy investment_returns_history_admin_all on public.investment_returns_history
  for all using (public.is_admin()) with check (public.is_admin());
