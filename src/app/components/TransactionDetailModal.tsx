import { X, ArrowUpRight, ArrowDownRight, Hash, CalendarDays, Target, FileText } from "lucide-react";
import { formatXAF } from "../lib/format";
import type { Transaction } from "../types";
import { useAppContext } from "../context/AppContext";

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const amount = transaction.amount ?? 0;
  const isCredit = amount > 0;
  const date = transaction.date || transaction.created_at || "";
  const account = transaction.account || transaction.account_type || "";
  const txnType = transaction.type || transaction.transaction_type || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
              {isCredit ? <ArrowDownRight size={18} color="#4CAF68" /> : <ArrowUpRight size={18} color="#E5484D" />}
            </div>
            <div>
              <p className="text-sm font-semibold">{transaction.description || ""}</p>
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
              {isCredit ? "+" : "−"}{formatXAF(amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <CalendarDays size={12} />
                {fr ? "Date" : "Date"}
              </div>
              <p className="text-sm font-medium">{date}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Hash size={12} />
                {fr ? "Type" : "Type"}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${txnType === "Deposit" ? "bg-[#E8F5EC] text-[#1F9D55]" : txnType === "Withdrawal" ? "bg-red-50 text-[#E5484D]" : "bg-[#F0E8FF] text-[#6E3A9A]"}`}>
                {txnType}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Target size={12} />
                {fr ? "Compte" : "Account"}
              </div>
              <p className="text-sm font-medium">{account}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <FileText size={12} />
                {fr ? "Statut" : "Status"}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5EC] text-[#1F9D55] font-medium">
                {transaction.status || "Completed"}
              </span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
