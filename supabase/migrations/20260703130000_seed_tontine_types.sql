-- Seed default tontine types so the admin create-tontine dropdown has options

insert into public.tontine_types (name, description, contribution_amount, frequency) values
  ('Épargne Classique', 'Tontine d''épargne hebdomadaire classique', 5000, 'weekly'),
  ('Épargne Premium', 'Tontine d''épargne hebdomadaire premium', 10000, 'weekly'),
  ('Épargne Mensuelle', 'Tontine d''épargne mensuelle', 25000, 'monthly'),
  ('Tontine Famille', 'Tontine familiale hebdomadaire', 3000, 'weekly'),
  ('Tontine Affaires', 'Tontine pour investisseurs', 50000, 'monthly')
on conflict do nothing;
