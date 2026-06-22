create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  account_type account_type not null,
  balance numeric(14,2) not null default 0 check (balance >= 0),
  currency text not null default 'XAF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, account_type)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  type transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  balance_after numeric(14,2) not null,
  recorded_by uuid not null references public.admins (id),
  transaction_reference text unique,
  external_id text,
  notes text,
  created_at timestamptz not null default now()
);
