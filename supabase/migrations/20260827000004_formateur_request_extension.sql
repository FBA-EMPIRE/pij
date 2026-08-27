-- =====================================================================
-- corrective_implementation_plan.md, Phase 2. Extends the existing
-- formateur_requests table (Phase 1 of the original IMPLEMENTATION_PLAN.md)
-- with the fields the new trainer-application form needs to collect
-- (name, email, category), plus a child table + private storage bucket
-- for the 1-3 supporting qualification documents. Ambiguity B4 (category:
-- free text vs. a fixed list) is resolved as free text for now -- easy to
-- tighten with a check constraint later without another schema change.
-- =====================================================================

alter table public.formateur_requests
  add column applicant_name text not null default '',
  add column applicant_email text not null default '',
  add column category text not null default '';

alter table public.formateur_requests alter column applicant_name drop default;
alter table public.formateur_requests alter column applicant_email drop default;
alter table public.formateur_requests alter column category drop default;

create table public.formateur_request_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.formateur_requests (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size text,
  created_at timestamptz not null default now()
);

create index idx_formateur_request_documents_request on public.formateur_request_documents (request_id);

alter table public.formateur_request_documents enable row level security;

-- No client-side insert policy -- like formateur_requests itself,
-- document rows are written only by the Phase 3 Edge Function
-- (service role), matching this codebase's established convention for
-- privileged mutations.
create policy formateur_request_documents_select on public.formateur_request_documents
  for select using (
    exists (select 1 from public.formateur_requests r where r.id = request_id and r.user_id = auth.uid())
    or public.is_admin()
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('formateur-applications', 'formateur-applications', false, 10485760,
        array['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
on conflict (id) do nothing;

-- Private bucket: files are stored under `${userId}/${requestId}/...`, so
-- the owner can read their own via the folder-name check; admins can read
-- everyone's. No client-side insert/update/delete policy -- uploads only
-- happen through the Phase 3 Edge Function's service-role client.
create policy "formateur_applications_owner_read" on storage.objects
  for select using (
    bucket_id = 'formateur-applications'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
