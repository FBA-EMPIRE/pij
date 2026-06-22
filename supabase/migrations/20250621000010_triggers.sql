create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_admins_updated_at before update on public.admins for each row execute function public.set_updated_at();
create trigger trg_savings_goals_updated_at before update on public.savings_goals for each row execute function public.set_updated_at();
