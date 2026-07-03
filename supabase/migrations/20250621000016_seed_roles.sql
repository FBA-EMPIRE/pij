insert into public.roles (name, description, is_system_role) values
  ('super_admin', 'Full system access with all administrative privileges', true),
  ('admin', 'Standard administrative access for day-to-day management', true),
  ('kyc_officer', 'Limited to reviewing and approving KYC documents', true),
  ('support_agent', 'Limited to viewing member data and responding to inquiries', true)
on conflict (name) do nothing;
