create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  uid text not null unique,
  email text not null unique,
  phone text unique,
  status user_status not null default 'pending',
  kyc_status kyc_status not null default 'not_submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text,
  address text,
  city text,
  region text,
  country text default 'Cameroon',
  profile_photo_url text,
  preferred_language text not null default 'en',
  theme_preference text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  module text not null
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  is_active boolean not null default true,
  mfa_enabled boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
