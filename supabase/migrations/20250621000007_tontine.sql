create table public.tontine_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  contribution_amount numeric(14,2) not null check (contribution_amount > 0),
  frequency tontine_frequency not null,
  created_by uuid references public.admins (id),
  created_at timestamptz not null default now()
);

create table public.tontines (
  id uuid primary key default gen_random_uuid(),
  type_id uuid not null references public.tontine_types (id),
  name text not null,
  capacity integer not null check (capacity > 0),
  frequency tontine_frequency not null,
  entry_fee numeric(14,2) not null default 0,
  status tontine_status not null default 'open',
  start_date date not null,
  created_by uuid references public.admins (id),
  created_at timestamptz not null default now()
);

create table public.tontine_members (
  id uuid primary key default gen_random_uuid(),
  tontine_id uuid not null references public.tontines (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  status tontine_member_status not null default 'pending',
  payout_order integer,
  has_received_payout boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (tontine_id, user_id)
);

create table public.tontine_rounds (
  id uuid primary key default gen_random_uuid(),
  tontine_id uuid not null references public.tontines (id) on delete cascade,
  round_number integer not null,
  recipient_member_id uuid references public.tontine_members (id),
  status round_status not null default 'pending',
  payout_date date,
  recorded_by uuid references public.admins (id),
  created_at timestamptz not null default now(),
  unique (tontine_id, round_number)
);

create table public.tontine_contributions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.tontine_rounds (id) on delete cascade,
  member_id uuid not null references public.tontine_members (id) on delete cascade,
  amount numeric(14,2) not null,
  status contribution_status not null default 'unpaid',
  recorded_by uuid references public.admins (id),
  paid_at timestamptz,
  unique (round_id, member_id)
);
