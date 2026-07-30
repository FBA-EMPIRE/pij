-- =====================================================================
-- Migration: Add 'investment' account_type so admin wallet adjustments
-- and return distributions can be backed by real accounts/transactions
-- rows, matching how savings/current balances already work.
-- =====================================================================

alter type public.account_type add value if not exists 'investment';
