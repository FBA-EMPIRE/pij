-- =====================================================================
-- Migration: Add missing enum values for frontend compatibility
-- =====================================================================

-- 1. account_type: add 'investment'
alter type public.account_type add value if not exists 'investment';

-- 2. transaction_type: add 'tontine'
alter type public.transaction_type add value if not exists 'tontine';

-- 3. tontine_frequency: add 'biweekly'
alter type public.tontine_frequency add value if not exists 'biweekly';

-- 4. tontine_status: add frontend-used values (case-sensitive)
alter type public.tontine_status add value if not exists 'Draft';
alter type public.tontine_status add value if not exists 'In Progress';
alter type public.tontine_status add value if not exists 'Completed';
alter type public.tontine_status add value if not exists 'Archived';

-- 5. notification_type: add frontend-used values
alter type public.notification_type add value if not exists 'join_request';
alter type public.notification_type add value if not exists 'entry_fee';
alter type public.notification_type add value if not exists 'contribution';
alter type public.notification_type add value if not exists 'payout';
alter type public.notification_type add value if not exists 'completion';
alter type public.notification_type add value if not exists 'info';
alter type public.notification_type add value if not exists 'warning';
alter type public.notification_type add value if not exists 'success';

-- 6. tontine_member_status: add 'Pending Entry Fee'
alter type public.tontine_member_status add value if not exists 'Pending Entry Fee';
