-- =====================================================================
-- The original Formation module spec called for is_paid/price on
-- formations (paid formations, price > 0 when is_paid), but the table
-- as actually created never got these columns. Adding them now that the
-- Paramètres tab needs to expose and edit them.
-- =====================================================================

alter table public.formations
  add column is_paid boolean not null default false,
  add column price numeric(12, 2) not null default 0 check (price >= 0);

alter table public.formations
  add constraint formations_price_when_paid check (not is_paid or price > 0);
