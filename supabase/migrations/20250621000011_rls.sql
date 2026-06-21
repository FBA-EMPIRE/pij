create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.admins a where a.id = auth.uid() and a.is_active);
$$ language sql stable security definer;

create or replace function public.current_admin_role()
returns text as $$
  select r.name from public.admins a join public.roles r on r.id = a.role_id where a.id = auth.uid();
$$ language sql stable security definer;

-- users
alter table public.users enable row level security;

create policy users_select_own on public.users
  for select using (id = auth.uid() or public.is_admin());

create policy users_update_own on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy users_admin_manage on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- profiles
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy profiles_admin_manage on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- admins
alter table public.admins enable row level security;

create policy admins_self_select on public.admins
  for select using (id = auth.uid() or public.current_admin_role() = 'super_admin');

create policy admins_super_admin_manage on public.admins
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

-- roles
alter table public.roles enable row level security;

create policy roles_read_all_admins on public.roles
  for select using (public.is_admin());

create policy roles_super_admin_manage on public.roles
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

-- permissions
alter table public.permissions enable row level security;

create policy permissions_read_all_admins on public.permissions
  for select using (public.is_admin());

create policy permissions_super_admin_manage on public.permissions
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

-- role_permissions
alter table public.role_permissions enable row level security;

create policy role_permissions_read_all_admins on public.role_permissions
  for select using (public.is_admin());

create policy role_permissions_super_admin_manage on public.role_permissions
  for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

-- kyc_documents
alter table public.kyc_documents enable row level security;

create policy kyc_select_own on public.kyc_documents
  for select using (user_id = auth.uid() or public.is_admin());

create policy kyc_insert_own on public.kyc_documents
  for insert with check (user_id = auth.uid());

create policy kyc_admin_review on public.kyc_documents
  for update using (public.is_admin()) with check (public.is_admin());

-- accounts
alter table public.accounts enable row level security;

create policy accounts_select_own on public.accounts
  for select using (user_id = auth.uid() or public.is_admin());

create policy accounts_admin_manage on public.accounts
  for all using (public.is_admin()) with check (public.is_admin());

-- transactions
alter table public.transactions enable row level security;

create policy transactions_select_own on public.transactions
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.accounts acc
      where acc.id = transactions.account_id and acc.user_id = auth.uid()
    )
  );

create policy transactions_admin_insert on public.transactions
  for insert with check (public.is_admin());

-- savings_goals
alter table public.savings_goals enable row level security;

create policy savings_goals_owner_all on public.savings_goals
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- tontine_types
alter table public.tontine_types enable row level security;

create policy tontine_types_read_all on public.tontine_types
  for select using (true);

create policy tontine_types_admin_manage on public.tontine_types
  for all using (public.is_admin()) with check (public.is_admin());

-- tontines
alter table public.tontines enable row level security;

create policy tontines_read_all on public.tontines
  for select using (true);

create policy tontines_admin_manage on public.tontines
  for all using (public.is_admin()) with check (public.is_admin());

-- tontine_members
alter table public.tontine_members enable row level security;

create policy tontine_members_select on public.tontine_members
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.tontine_members tm2
      where tm2.tontine_id = tontine_members.tontine_id and tm2.user_id = auth.uid()
    )
  );

create policy tontine_members_apply on public.tontine_members
  for insert with check (user_id = auth.uid());

create policy tontine_members_admin_manage on public.tontine_members
  for update using (public.is_admin()) with check (public.is_admin());

-- tontine_rounds
alter table public.tontine_rounds enable row level security;

create policy tontine_rounds_select on public.tontine_rounds
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.tontine_members tm
      where tm.tontine_id = tontine_rounds.tontine_id and tm.user_id = auth.uid()
    )
  );

create policy tontine_rounds_admin_manage on public.tontine_rounds
  for all using (public.is_admin()) with check (public.is_admin());

-- tontine_contributions
alter table public.tontine_contributions enable row level security;

create policy tontine_contrib_select on public.tontine_contributions
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.tontine_members tm
      join public.tontine_rounds tr on tr.id = tontine_contributions.round_id
      where tm.id = tontine_contributions.member_id and tm.tontine_id = tr.tontine_id
        and exists (select 1 from public.tontine_members tm2
          where tm2.tontine_id = tr.tontine_id and tm2.user_id = auth.uid())
    )
  );

create policy tontine_contrib_admin_manage on public.tontine_contributions
  for all using (public.is_admin()) with check (public.is_admin());

-- notifications
alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notifications_admin_insert on public.notifications
  for insert with check (public.is_admin());

-- audit_logs
alter table public.audit_logs enable row level security;

create policy audit_logs_admin_select on public.audit_logs
  for select using (public.is_admin());

create policy audit_logs_system_insert on public.audit_logs
  for insert with check (true);
