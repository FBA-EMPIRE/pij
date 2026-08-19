insert into public.roles (name, description, is_system_role) values
  ('formateur', 'Manages formations and training content only', true)
on conflict (name) do nothing;
