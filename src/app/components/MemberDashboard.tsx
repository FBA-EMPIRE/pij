import { useNavigate } from "react-router";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, ChevronRight, AlertCircle } from "lucide-react";
import { TRANSACTIONS, SAVINGS_GOALS, TONTINES, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface MemberDashboardProps {
  lang?: "fr" | "en";
}

export default function MemberDashboard({ lang = "fr" }: MemberDashboardProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";
  const recentTxns = TRANSACTIONS.slice(0, 5);
  const mainGoal = SAVINGS_GOALS[0];
  const activeTontine = TONTINES[0];
  const goalPct = Math.round((mainGoal.current / mainGoal.target) * 100);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* KYC banner */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F0E8FF] border border-[#6E3A9A]/20">
        <AlertCircle size={16} color="#6E3A9A" className="shrink-0" />
        <p className="text-sm text-[#6E3A9A]">
          {fr ? "Votre compte est actif. " : "Your account is active. "}
          <button onClick={() => navigate("/tontines")} className="font-medium underline">{fr ? "Rejoindre une tontine →" : "Join a tontine →"}</button>
        </p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1E2530 0%, #2A3444 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#4CAF68", transform: "translate(30%, -30%)" }} />
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{fr ? "Compte Courant" : "Current Account"}</p>
          <p className="text-xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "Geist Mono, monospace" }}>
            450 000 <span className="text-sm sm:text-lg font-normal text-white/70">XAF</span>
          </p>
          <p className="text-xs text-white/50">{fr ? "Mis à jour le 10 juin 2024" : "Updated June 10, 2024"}</p>
          <div className="mt-4 flex items-center gap-2">
            <StatusBadge status="Active" size="sm" />
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4CAF68 0%, #1F9D55 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "#FFFFFF", transform: "translate(30%, -30%)" }} />
          <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{fr ? "Compte Épargne" : "Savings Account"}</p>
          <p className="text-xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "Geist Mono, monospace" }}>
            1 200 000 <span className="text-sm sm:text-lg font-normal text-white/70">XAF</span>
          </p>
          <p className="text-xs text-white/60">{fr ? "Mis à jour le 10 juin 2024" : "Updated June 10, 2024"}</p>
          <div className="mt-4 flex items-center gap-2">
            <StatusBadge status="Active" size="sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Transactions récentes" : "Recent transactions"}</h3>
              <button onClick={() => navigate("/transactions")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline shrink-0">
                {fr ? "Tout voir" : "View all"} <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-1">
              {recentTxns.map((txn) => {
                const isCredit = txn.amount > 0;
                return (
                  <div key={txn.id} className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-border last:border-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
                      {isCredit ? <ArrowDownRight size={16} color="#4CAF68" /> : <ArrowUpRight size={16} color="#E5484D" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date} · {txn.account}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                      {isCredit ? "+" : "−"}{formatXAF(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Savings Goal */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Objectif principal" : "Main goal"}</h3>
              <button onClick={() => navigate("/savings")} className="text-xs text-[#4CAF68] font-medium hover:underline shrink-0">{fr ? "Voir tout" : "View all"}</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl sm:text-2xl">{mainGoal.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{mainGoal.name}</p>
                <p className="text-xs text-muted-foreground">{fr ? "Échéance:" : "Deadline:"} {mainGoal.deadline}</p>
              </div>
            </div>
            {/* Circular progress */}
            <div className="flex flex-col items-center my-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#4CAF68" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - goalPct / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{goalPct}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fr ? "Actuel" : "Current"}</span>
                <span className="font-medium text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.current)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fr ? "Objectif" : "Target"}</span>
                <span className="font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.target)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fr ? "Restant" : "Remaining"}</span>
                <span className="font-medium text-[#E5484D]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.target - mainGoal.current)}</span>
              </div>
            </div>
          </div>

          {/* Tontine Summary */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Ma Tontine" : "My Tontine"}</h3>
              <button onClick={() => navigate("/tontines")} className="text-xs text-[#4CAF68] font-medium hover:underline shrink-0">{fr ? "Voir" : "View"}</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{fr ? "Tontine active" : "Active tontine"}</span>
                <StatusBadge status="Active" size="sm" />
              </div>
              <p className="text-sm font-medium">{activeTontine.name}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{fr ? "Progression" : "Progress"}</span>
                <span className="font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>
                  {fr ? "Semaine" : "Week"} {activeTontine.current_week}/{activeTontine.total_weeks}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${(activeTontine.current_week / activeTontine.total_weeks) * 100}%` }} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {fr ? "Prochaine contribution: 17 juin" : "Next contribution: June 17"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activeTontine.enrolled} {fr ? "membres" : "members"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
