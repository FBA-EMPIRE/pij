-- =====================================================================
-- Migration: File storage support for Formation Management
-- formation_courses had no column to store an uploaded cover image path,
-- and formation_content had no column to store the actual uploaded
-- file's storage path or an external link URL (only display metadata
-- like file_name/file_size existed). Add what's needed for real uploads.
-- =====================================================================

alter table public.formation_courses
  add column if not exists cover_image_path text;

alter table public.formation_content
  add column if not exists storage_path text,
  add column if not exists external_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'formation-assets',
  'formation-assets',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

drop policy if exists "formation_assets_public_read" on storage.objects;
create policy "formation_assets_public_read" on storage.objects
  for select using (bucket_id = 'formation-assets');

drop policy if exists "formation_assets_admin_write" on storage.objects;
create policy "formation_assets_admin_write" on storage.objects
  for insert with check (bucket_id = 'formation-assets' and public.is_admin());

drop policy if exists "formation_assets_admin_update" on storage.objects;
create policy "formation_assets_admin_update" on storage.objects
  for update using (bucket_id = 'formation-assets' and public.is_admin());

drop policy if exists "formation_assets_admin_delete" on storage.objects;
create policy "formation_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'formation-assets' and public.is_admin());
