create table if not exists public.verification_codes (
  id        uuid primary key default gen_random_uuid(),
  email     text not null,
  code      text not null,
  expires_at timestamptz not null,
  used_at   timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_verification_codes_email
  on public.verification_codes (email);

create index if not exists idx_verification_codes_lookup
  on public.verification_codes (email, code);
