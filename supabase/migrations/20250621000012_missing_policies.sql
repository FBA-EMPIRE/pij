-- =====================================================================
-- Migration 12: Missing RLS policies & auth trigger
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Auth trigger: create public.users + public.profiles on signup
-- ---------------------------------------------------------------------
-- Without this, signing up creates auth.users but no public.users row.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, uid, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'uid', 'UID-' || substr(new.id::text, 1, 8)),
    new.email
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. kyc_documents: allow owner to delete their own pending documents
-- ---------------------------------------------------------------------
create policy kyc_delete_own_pending on public.kyc_documents
  for delete using (
    user_id = auth.uid()
    and status = 'pending'
  );

-- ---------------------------------------------------------------------
-- 3. notifications: allow owner to delete their own notifications
-- ---------------------------------------------------------------------
create policy notifications_delete_own on public.notifications
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 4. tontine_members: admins can insert members directly (not just users self-applying)
-- ---------------------------------------------------------------------
create policy tontine_members_admin_insert on public.tontine_members
  for insert with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. tontine_members: admins can delete members (e.g. remove fraudulent entry)
-- ---------------------------------------------------------------------
create policy tontine_members_admin_delete on public.tontine_members
  for delete using (public.is_admin());
