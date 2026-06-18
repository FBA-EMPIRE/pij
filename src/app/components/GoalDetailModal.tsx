import { useState } from "react";
import { X, Calendar, Plus, TrendingUp, History, Edit3, ArrowDownRight } from "lucide-react";
import { SAVINGS_GOALS, TRANSACTIONS, formatXAF } from "./mockData";
import type { SavingsGoal } from "../types";

interface GoalDetailModalProps {
  goal: SavingsGoal;
  lang?: "fr" | "en";
  onClose: () => void;
}

export default function GoalDetailModal({ goal, lang = "fr", onClose }: GoalDetailModalProps) {
  const fr = lang === "fr";
  const [tab, setTab] = useState<"overview" | "history" | "edit">("overview");
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.target));
  const [editDeadline, setEditDeadline] = useState(goal.deadline);
  const [contributionAmount, setContributionAmount] = useState("");

  const pct = Math.round((goal.current / goal.target) * 100);
  const goalTxns = TRANSACTIONS.filter((t) => t.goalId === goal.id && t.amount > 0);
  const totalSaved = goalTxns.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.icon}</span>
            <div>
              <p className="text-sm font-semibold">{goal.name}</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{goal.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4 pb-2">
          {[
            { key: "overview" as const, label: fr ? "Vue d'ensemble" : "Overview", icon: TrendingUp },
            { key: "history" as const, label: fr ? "Historique" : "History", icon: History },
            { key: "edit" as const, label: fr ? "Modifier" : "Edit", icon: Edit3 },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? "bg-[#4CAF68] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-5 pt-3">
          {tab === "overview" && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{fr ? "Progression" : "Progress"}</span>
                  <span className="font-bold" style={{ color: goal.color, fontFamily: "Geist Mono, monospace" }}>{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Épargné" : "Saved"}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: goal.color, fontFamily: "Geist Mono, monospace" }}>{formatXAF(goal.current)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Objectif" : "Target"}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goal.target)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Restant" : "Remaining"}</p>
                  <p className="text-sm font-bold mt-0.5 text-[#E5484D]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goal.target - goal.current)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Échéance" : "Deadline"}</p>
                  <p className="text-sm font-bold mt-0.5 flex items-center gap-1"><Calendar size={12} /> {goal.deadline}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground mb-2">{fr ? "Ajouter une contribution" : "Add contribution"}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                    placeholder={fr ? "Montant" : "Amount"}
                  />
                  <button
                    onClick={() => {
                      const amt = parseInt(contributionAmount);
                      if (amt > 0) {
                        TRANSACTIONS.push({
                          id: `TXN-NEW-${Date.now()}`,
                          date: new Date().toISOString().slice(0, 10),
                          type: "Deposit",
                          amount: amt,
                          description: fr ? `Dépôt objectif: ${goal.name}` : `Deposit for: ${goal.name}`,
                          account: "Épargne",
                          status: "Completed",
                          goalId: goal.id,
                        });
                        goal.current += amt;
                        setContributionAmount("");
                      }
                    }}
                    disabled={!contributionAmount || parseInt(contributionAmount) <= 0}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all"
                    style={{ background: "#4CAF68" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-2">
              {goalTxns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucune contribution enregistrée" : "No contributions recorded"}</p>
              ) : (
                goalTxns.map((txn, i) => (
                  <div key={txn.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F5EC] flex items-center justify-center shrink-0">
                      <ArrowDownRight size={14} color="#4CAF68" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date} · {txn.account}</p>
                    </div>
                    <span className="text-sm font-bold text-[#1F9D55] shrink-0" style={{ fontFamily: "Geist Mono, monospace" }}>
                      +{formatXAF(txn.amount)}
                    </span>
                  </div>
                ))
              )}
              {totalSaved < goal.target && (
                <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-muted" />
                  {totalSaved > 0 ? `${formatXAF(goal.target - totalSaved)} ${fr ? "restants" : "remaining"}` : ""}
                  <div className="flex-1 h-px bg-muted" />
                </div>
              )}
            </div>
          )}

          {tab === "edit" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{fr ? "Nom de l'objectif" : "Goal name"}</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Montant cible (XAF)" : "Target amount (XAF)"}</label>
                <input type="number" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Date d'échéance" : "Target date"}</label>
                <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <button
                onClick={() => {
                  goal.name = editName;
                  goal.target = parseInt(editTarget) || goal.target;
                  goal.deadline = editDeadline;
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
                style={{ background: "#4CAF68" }}
              >
                {fr ? "Enregistrer" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
