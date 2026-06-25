-- =====================================================================
-- Migration 14: Create kyc-documents bucket, storage RLS, fix uid prefix
-- =====================================================================

-- 1. Create the storage bucket for KYC documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
)
on conflict (id) do nothing;

-- 2. Allow authenticated users to upload into their own folder
create policy "kyc_uploads_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow authenticated users to select their own uploads
create policy "kyc_uploads_select_own" on storage.objects
  for select using (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Update uid prefix to PIJ- instead of UID-
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, uid, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'uid', 'PIJ-' || substr(new.id::text, 1, 8)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );

  insert into public.profiles (user_id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );

  return new;
end;
$$ language plpgsql security definer;
