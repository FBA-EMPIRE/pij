create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status kyc_status not null default 'pending',
  reviewed_by uuid references public.admins (id),
  reviewed_at timestamptz,
  rejection_reason text,
  submitted_at timestamptz not null default now()
);
