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
