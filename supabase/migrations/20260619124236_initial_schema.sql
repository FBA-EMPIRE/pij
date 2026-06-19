CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Members (users of the platform)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  email_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  kyc TEXT DEFAULT 'Pending' CHECK (kyc IN ('Pending', 'Approved', 'Rejected')),
  kyc_reviewed_by UUID,
  kyc_reviewed_at TIMESTAMPTZ,
  kyc_rejection_reason TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Suspended')),
  balance_current NUMERIC(12, 2) DEFAULT 0,
  balance_savings NUMERIC(12, 2) DEFAULT 0,
  balance_investment NUMERIC(12, 2) DEFAULT 0,
  joined TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions (deposits, withdrawals, tontine contributions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id),
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current', 'investment')),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'tontine')),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  recorded_by UUID REFERENCES members(id),
  goal_id UUID,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tontine types (definitions/templates)
CREATE TABLE tontine_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  description TEXT,
  description_en TEXT,
  default_contribution NUMERIC(12, 2) DEFAULT 0,
  default_capacity INTEGER DEFAULT 10,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tontine groups (specific instances)
CREATE TABLE tontine_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID NOT NULL REFERENCES tontine_types(id),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contribution NUMERIC(12, 2) DEFAULT 0,
  entry_fee NUMERIC(12, 2) DEFAULT 0,
  capacity INTEGER NOT NULL,
  enrolled INTEGER DEFAULT 0,
  total_weeks INTEGER DEFAULT 0,
  current_week INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'In Progress', 'Completed', 'Archived')),
  pool_amount NUMERIC(12, 2) DEFAULT 0,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Join requests for tontine groups
CREATE TABLE tontine_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id),
  tontine_id UUID NOT NULL REFERENCES tontine_groups(id),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Pending Entry Fee', 'Approved', 'Rejected')),
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contribution logs for tontine rounds
CREATE TABLE contribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES tontine_groups(id),
  member_id UUID NOT NULL REFERENCES members(id),
  round INTEGER NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  recorded_by UUID REFERENCES members(id),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_tontine_join_requests_user_id ON tontine_join_requests(user_id);
CREATE INDEX idx_tontine_join_requests_tontine_id ON tontine_join_requests(tontine_id);
CREATE INDEX idx_contribution_logs_tontine_id ON contribution_logs(tontine_id);
