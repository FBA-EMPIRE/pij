create table public.formateur_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid references public.admins (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_formateur_requests_one_pending_per_user
  on public.formateur_requests (user_id) where (status = 'pending');

create index idx_formateur_requests_status on public.formateur_requests (status);

create trigger trg_formateur_requests_updated_at before update on public.formateur_requests
  for each row execute function public.set_updated_at();

alter table public.formateur_requests enable row level security;

create policy formateur_requests_insert_own on public.formateur_requests
  for insert with check (auth.uid() = user_id);

create policy formateur_requests_select_own on public.formateur_requests
  for select using (auth.uid() = user_id or public.is_admin());
