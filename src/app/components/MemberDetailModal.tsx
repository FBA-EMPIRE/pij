import { useEffect, useState } from "react";
import { X, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { formatXAF } from "../lib/format";

interface MemberDetailModalProps {
  memberId: string;
  onClose: () => void;
}

export default function MemberDetailModal({ memberId, onClose }: MemberDetailModalProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<"goals" | "transactions">("goals");
  const [member, setMember] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [balances, setBalances] = useState<{ current: number; savings: number }>({ current: 0, savings: 0 });

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase
        .from("users")
        .select("*, profiles(first_name, last_name)")
        .eq("id", memberId)
        .single();
      if (user) {
        const name = [user.profiles?.first_name, user.profiles?.last_name].filter(Boolean).join(" ") || user.email || "Unknown";
        setMember({ ...user, name });
      }

      const { data: g } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", memberId);
      if (g) setGoals(g);

      const { data: a } = await supabase
        .from("accounts")
        .select("account_type, balance")
        .eq("user_id", memberId);
      if (a) {
        const b = { current: 0, savings: 0 };
        for (const acc of a) {
          if (acc.account_type === "current") b.current += Number(acc.balance ?? 0);
          else if (acc.account_type === "savings") b.savings += Number(acc.balance ?? 0);
        }
        setBalances(b);
      }

      const { data: t } = await supabase
        .from("transactions")
        .select("*, accounts!inner(account_type)")
        .eq("accounts.user_id", memberId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (t) setTxns(t);
    })();
  }, [memberId]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{member.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4 pb-2">
          <button
            onClick={() => setTab("goals")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "goals" ? "bg-[#4CAF68] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {fr ? "Objectifs épargne" : "Savings Goals"}
          </button>
          <button
            onClick={() => setTab("transactions")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "transactions" ? "bg-[#4CAF68] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {fr ? "Transactions" : "Transactions"}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[55vh] p-5 pt-3">
          {tab === "goals" && (
            goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucun objectif d'épargne" : "No savings goals"}</p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const current = goal.current_amount ?? 0;
                  const target = goal.target_amount ?? 1;
                  const pct = Math.min(Math.round((current / target) * 100), 100);
                  return (
                    <div key={goal.id} className="p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">{fr ? "Échéance" : "Deadline"}: {goal.deadline}</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div className="h-2 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(current)} / {formatXAF(target)}</span>
                        <span className="font-medium text-[#4CAF68]">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "transactions" && (
            <div className="space-y-1">
              {txns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucune transaction" : "No transactions"}</p>
              ) : (
                txns.map((txn) => {
                  const isCredit = txn.type === "deposit";
                  return (
                    <div key={txn.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
                        {isCredit ? <ArrowDownRight size={14} color="#4CAF68" /> : <ArrowUpRight size={14} color="#E5484D" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{txn.description || txn.notes || ""}</p>
                        <p className="text-xs text-muted-foreground">{txn.created_at?.slice(0, 10)} · {txn.accounts?.account_type}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                        {isCredit ? "+" : "−"}{formatXAF(txn.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {fr ? "Courant" : "Current"}: <span className="text-foreground font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(balances.current)}</span>
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} color="#4CAF68" />
            {fr ? "Épargne" : "Savings"}: <span className="text-[#4CAF68] font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(balances.savings)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
