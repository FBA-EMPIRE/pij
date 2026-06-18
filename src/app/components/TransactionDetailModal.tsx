import { X, ArrowUpRight, ArrowDownRight, Hash, CalendarDays, Target, FileText } from "lucide-react";
import { formatXAF, TRANSACTIONS, SAVINGS_GOALS, AUDIT_LOGS } from "./mockData";
import type { Transaction } from "../types";

interface TransactionDetailModalProps {
  transaction: Transaction;
  lang?: "fr" | "en";
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, lang = "fr", onClose }: TransactionDetailModalProps) {
  const fr = lang === "fr";
  const isCredit = transaction.amount > 0;

  const linkedGoal = transaction.goalId
    ? SAVINGS_GOALS.find((g) => g.id === transaction.goalId)
    : null;

  const linkedAudit = transaction.auditLogId
    ? AUDIT_LOGS.find((l) => l.id === transaction.auditLogId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
              {isCredit ? <ArrowDownRight size={18} color="#4CAF68" /> : <ArrowUpRight size={18} color="#E5484D" />}
            </div>
            <div>
              <p className="text-sm font-semibold">{transaction.description}</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{transaction.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: isCredit ? "#E8F5EC" : "#FEE2E2" }}>
            <span className="text-sm font-medium">{fr ? "Montant" : "Amount"}</span>
            <span className={`text-lg font-bold ${isCredit ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
              {isCredit ? "+" : "−"}{formatXAF(transaction.amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <CalendarDays size={12} />
                {fr ? "Date" : "Date"}
              </div>
              <p className="text-sm font-medium">{transaction.date}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Hash size={12} />
                {fr ? "Type" : "Type"}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${transaction.type === "Deposit" ? "bg-[#E8F5EC] text-[#1F9D55]" : transaction.type === "Withdrawal" ? "bg-red-50 text-[#E5484D]" : "bg-[#F0E8FF] text-[#6E3A9A]"}`}>
                {transaction.type}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Target size={12} />
                {fr ? "Compte" : "Account"}
              </div>
              <p className="text-sm font-medium">{transaction.account}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <FileText size={12} />
                {fr ? "Statut" : "Status"}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5EC] text-[#1F9D55] font-medium">
                {transaction.status}
              </span>
            </div>
          </div>

          {linkedGoal && (
            <div className="p-3 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground mb-1">{fr ? "Objectif lié" : "Linked goal"}</p>
              <p className="text-sm font-medium">{linkedGoal.icon} {linkedGoal.name}</p>
            </div>
          )}

          {linkedAudit && (
            <div className="p-3 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground mb-1">{fr ? "Journal d'audit" : "Audit log"}</p>
              <p className="text-sm font-medium">{linkedAudit.action}</p>
              <p className="text-xs text-muted-foreground">{linkedAudit.actor} · {linkedAudit.timestamp}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
