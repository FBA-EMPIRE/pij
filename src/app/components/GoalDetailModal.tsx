import { useEffect, useState } from "react";
import { X, Calendar, Plus, TrendingUp, History, Edit3, ArrowDownRight } from "lucide-react";
import type { SavingsGoal } from "../types";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { contributeToGoal } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

interface GoalDetailModalProps {
  goal: SavingsGoal;
  onClose: () => void;
  onUpdated: () => void;
}

export default function GoalDetailModal({ goal, onClose, onUpdated }: GoalDetailModalProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<"overview" | "history" | "edit">("overview");
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.target_amount));
  const [editDeadline, setEditDeadline] = useState(goal.deadline);
  const [contributionAmount, setContributionAmount] = useState("");
  const [goalTxns, setGoalTxns] = useState<any[]>([]);
  const [goalCurrent, setGoalCurrent] = useState(goal.current_amount ?? 0);
  const [contributing, setContributing] = useState(false);
  const [contribError, setContribError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const loadTxns = () =>
    supabase
      .from("transactions")
      .select("*")
      .eq("goal_id", goal.id)
      .gt("amount", 0)
      .then(({ data }) => {
        if (data) setGoalTxns(data);
      });

  useEffect(() => {
    loadTxns();
  }, [goal.id]);

  const goalTarget = goal.target_amount ?? 1;
  const pct = Math.min(Math.round((goalCurrent / goalTarget) * 100), 100);
  const totalSaved = goalTxns.reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
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
                  <span className="font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Épargné" : "Saved"}</p>
                  <p className="text-sm font-bold mt-0.5 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goalCurrent)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Objectif" : "Target"}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goalTarget)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Restant" : "Remaining"}</p>
                  <p className="text-sm font-bold mt-0.5 text-[#E5484D]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goalTarget - goalCurrent)}</p>
                </div>
                <div className="p-3 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">{fr ? "Échéance" : "Deadline"}</p>
                  <p className="text-sm font-bold mt-0.5 flex items-center gap-1"><Calendar size={12} /> {goal.deadline}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground mb-2">{fr ? "Ajouter une contribution" : "Add contribution"}</p>
                {contribError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs">{contribError}</div>
                )}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                    placeholder={fr ? "Montant" : "Amount"}
                  />
                  <button
                    onClick={async () => {
                      const amt = parseInt(contributionAmount);
                      if (!(amt > 0)) return;
                      setContribError("");
                      setContributing(true);
                      try {
                        const result = await contributeToGoal({ goal_id: goal.id, amount: amt });
                        setGoalCurrent(Number(result.goal?.current_amount ?? goalCurrent + amt));
                        setContributionAmount("");
                        await loadTxns();
                        onUpdated();
                      } catch (err: any) {
                        setContribError(err?.message || (fr ? "Erreur lors de la contribution." : "Error recording contribution."));
                      } finally {
                        setContributing(false);
                      }
                    }}
                    disabled={!contributionAmount || parseInt(contributionAmount) <= 0 || contributing}
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
                      <p className="text-sm truncate">{txn.notes}</p>
                      <p className="text-xs text-muted-foreground">{txn.created_at?.slice(0, 10)}</p>
                    </div>
                    <span className="text-sm font-bold text-[#1F9D55] shrink-0" style={{ fontFamily: "Geist Mono, monospace" }}>
                      +{formatXAF(txn.amount)}
                    </span>
                  </div>
                ))
              )}
              {totalSaved < goalTarget && (
                <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-muted" />
                  {totalSaved > 0 ? `${formatXAF(goalTarget - totalSaved)} ${fr ? "restants" : "remaining"}` : ""}
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
                <input type="date" value={editDeadline ?? ""} onChange={(e) => setEditDeadline(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              {editError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs">{editError}</div>
              )}
              <button
                disabled={editSaving}
                onClick={async () => {
                  setEditError("");
                  setEditSaving(true);
                  const { error } = await supabase
                    .from("savings_goals")
                    .update({
                      name: editName,
                      target_amount: parseInt(editTarget) || goalTarget,
                      deadline: editDeadline,
                    })
                    .eq("id", goal.id);
                  setEditSaving(false);
                  if (error) {
                    setEditError(error.message);
                    return;
                  }
                  onUpdated();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: "#4CAF68" }}
              >
                {editSaving ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Enregistrer" : "Save changes")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
