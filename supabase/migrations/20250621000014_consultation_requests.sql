create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,
  project text not null default '',
  need text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.consultation_requests enable row level security;

drop policy if exists "Users can insert their own consultation requests" on public.consultation_requests;
create policy "Users can insert their own consultation requests"
  on public.consultation_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own consultation requests" on public.consultation_requests;
create policy "Users can view their own consultation requests"
  on public.consultation_requests for select
  using (auth.uid() = user_id);
