-- =====================================================================
-- Migration: Allow admins to read KYC documents uploaded by any member
-- Previously the only SELECT policy on storage.objects for the
-- kyc-documents bucket restricted access to the uploader's own folder,
-- making it impossible for admins to view/preview member documents.
-- =====================================================================

drop policy if exists "kyc_uploads_select_admin" on storage.objects;
create policy "kyc_uploads_select_admin" on storage.objects
  for select using (
    bucket_id = 'kyc-documents'
    and public.is_admin()
  );
