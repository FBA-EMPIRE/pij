-- Create tontine_types independent of migration order (uses text instead of enum)
create table if not exists public.tontine_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  contribution_amount numeric(14,2) not null check (contribution_amount > 0),
  frequency text not null check (frequency in ('weekly', 'monthly')),
  created_by uuid references public.admins (id),
  created_at timestamptz not null default now()
);

-- Seed default tontine types
insert into public.tontine_types (name, description, contribution_amount, frequency) values
  ('Épargne Classique', 'Tontine d''épargne hebdomadaire classique', 5000, 'weekly'),
  ('Épargne Premium', 'Tontine d''épargne hebdomadaire premium', 10000, 'weekly'),
  ('Épargne Mensuelle', 'Tontine d''épargne mensuelle', 25000, 'monthly'),
  ('Tontine Famille', 'Tontine familiale hebdomadaire', 3000, 'weekly'),
  ('Tontine Affaires', 'Tontine pour investisseurs', 50000, 'monthly')
on conflict do nothing;
