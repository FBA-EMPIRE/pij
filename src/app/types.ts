export type AccountType = "savings" | "current";

export type AdminRole = "super_admin" | "admin";

export interface Admin {
  id: string;
  initials: string;
  initialsColor: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  lastLogin: string;
  lastLoginFr: string;
  status: "Active" | "Suspended";
  created: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: AdminRole;
  token: string;
  status: "Pending" | "Accepted" | "Expired" | "Revoked";
  sentAt: string;
  expiresAt: string;
  createdBy: string;
}

export interface TontineType {
  id: string;
  name: string;
  nameEn: string;
  frequency: Frequency;
  description: string;
  descriptionEn: string;
  defaultContribution: number;
  defaultCapacity: number;
  status: "Active" | "Inactive";
}

export type UserStatus = "pending" | "active" | "suspended" | "deactivated";
export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface Member {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  verificationCode?: string;
  kyc_status: KycStatus;
  status: UserStatus;
  balance_current: number;
  balance_savings: number;
  balance_investment: number;
  joined: string;
}

export type TransactionType = "deposit" | "withdrawal";

export interface Transaction {
  id: string;
  account_id: string;
  account_type: AccountType;
  type: TransactionType;
  amount: number;
  balance_after: number;
  notes: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  account_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: "active" | "completed" | "cancelled";
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  roi: string;
  minAmount: number;
  maxAmount: number;
  duration: string;
  riskLevel: "Faible" | "Modéré" | "Élevé";
  status: "Published" | "Draft" | "Archived";
}

export interface InvestmentAccount {
  id: string;
  memberId: string;
  productId: string;
  amount: number;
  currentValue: number;
  returns: number;
  status: "Active" | "Completed";
  startedAt: string;
}

export interface InvestmentTransaction {
  id: string;
  accountId: string;
  type: "Deposit" | "Withdrawal" | "Return";
  amount: number;
  description: string;
  createdAt: string;
}

export type TontineStatus = "open" | "active" | "closed";
export type Frequency = "weekly" | "monthly";
export type TontineMemberStatus = "pending" | "active" | "removed";
export type ContributionStatus = "paid" | "unpaid";
export type RoundStatus = "pending" | "paid";
export type NotificationType = "kyc_status" | "contribution_reminder" | "payout_alert" | "system" | "general";

export interface TontineMember {
  id: string;
  tontine_id: string;
  user_id: string;
  status: TontineMemberStatus;
  payout_order: number | null;
  has_received_payout: boolean;
  joined_at: string;
  users?: {
    id: string;
    email: string;
    name: string;
    full_name: string;
  };
}

export interface Tontine {
  id: string;
  type_id: string;
  name: string;
  capacity: number;
  frequency: Frequency;
  entry_fee: number;
  status: TontineStatus;
  start_date: string;
  created_by: string | null;
  created_at: string;
  tontine_types?: { name: string; contribution_amount: number };
}

export interface JoinRequest {
  id: string;
  tontine_id: string;
  user_id: string;
  status: TontineMemberStatus;
  joined_at: string;
}

export interface ContributionLog {
  id: string;
  round_id: string;
  member_id: string;
  amount: number;
  status: ContributionStatus;
  recorded_by: string | null;
  paid_at: string | null;
}

export interface TontineRound {
  id: string;
  tontine_id: string;
  round_number: number;
  recipient_member_id: string | null;
  status: RoundStatus;
  payout_date: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface TontineArchive {
  id: string;
  originalId: string;
  name: string;
  description: string;
  contribution: number;
  entry_fee: number;
  capacity: number;
  total_weeks: number;
  start_date: string;
  end_date: string;
  frequency: Frequency;
  members: any[];
  recipients: any[];
  total_collected: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  is_read: boolean;
  created_at: string;
}
