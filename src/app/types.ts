export type AccountType = "current" | "savings" | "investment";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  kyc: "Approved" | "Pending" | "Rejected";
  status: "Active" | "Pending" | "Suspended";
  balance_current: number;
  balance_savings: number;
  balance_investment: number;
  joined: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: "Deposit" | "Withdrawal" | "Tontine";
  amount: number;
  description: string;
  account: "Courant" | "Épargne" | "Investissement";
  status: "Completed";
  goalId?: string;
  auditLogId?: string;
}

export interface SavingsGoal {
  id: string;
  memberId: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
  allowOverfunding?: boolean;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
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

// ── Tontine types ──

export type TontineStatus = "Draft" | "Open" | "In Progress" | "Completed" | "Archived";
export type JoinRequestStatus = "Pending" | "Pending Entry Fee" | "Approved" | "Rejected";
export type Frequency = "weekly" | "biweekly" | "monthly";
export type NotificationType = "join_request" | "entry_fee" | "contribution" | "payout" | "completion" | "general";

export interface TontineMember {
  id: number;
  name: string;
  avatar: string;
  position: number;
  payout_received: boolean;
  contributions: boolean[];
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  contribution: number;
  entry_fee: number;
  capacity: number;
  enrolled: number;
  total_weeks: number;
  current_week: number;
  start_date: string;
  frequency: Frequency;
  status: TontineStatus;
  pool_amount: number;
  members: TontineMember[];
}

export interface JoinRequest {
  id: string;
  userId: string;
  tontineId: string;
  status: JoinRequestStatus;
  createdAt: string;
}

export interface ContributionLog {
  id: string;
  adminId: string;
  memberId: number;
  tontineId: string;
  round: number;
  previousStatus: boolean;
  newStatus: boolean;
  timestamp: string;
}

export interface RoundRecipient {
  id: string;
  tontineId: string;
  round: number;
  memberId: number;
  amount: number;
  assignedAt: string;
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
  members: TontineMember[];
  recipients: RoundRecipient[];
  total_collected: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  read: boolean;
  createdAt: string;
}
