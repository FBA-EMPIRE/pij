import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, ChevronRight, AlertCircle, ArrowLeft, Calendar, PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { getCurrentUserId, fetchTransactions, createTransactionRequest, fetchMyTransactionRequests } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { supabase } from "../lib/supabase/client";

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { lang, user } = useAppContext();
  const fr = lang === "fr";
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [tontines, setTontines] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [requestAction, setRequestAction] = useState<{ type: "deposit" | "withdrawal"; accountType: "current" | "savings" } | null>(null);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const loadData = async () => {
    const userId = await getCurrentUserId();
    const [txns, { data: goals }, { data: myTontines }, { data: prof }, { data: accts }, reqs] = await Promise.all([
      fetchTransactions(userId),
      supabase.from("savings_goals").select("*").eq("user_id", userId),
      supabase.from("tontine_members").select("*, tontine:tontines(*)").eq("user_id", userId),
      supabase.from("users").select("*, profiles(first_name, last_name)").eq("id", userId).single(),
      supabase.from("accounts").select("account_type, balance").eq("user_id", userId),
      fetchMyTransactionRequests(userId),
    ]);
    setTransactions(txns ?? []);
    setSavingsGoals(goals ?? []);
    setTontines(myTontines ?? []);
    setProfile(prof ?? null);
    setAccounts(accts ?? []);
    setRequests(reqs ?? []);
  };

  useEffect(() => {
    loadData().catch((err) => console.error(err)).finally(() => setLoading(false));
  }, []);

  const openRequestForm = (type: "deposit" | "withdrawal", accountType: "current" | "savings") => {
    setRequestAction({ type, accountType });
    setRequestAmount("");
    setRequestNotes("");
    setRequestError("");
    setRequestSuccess("");
  };

  const closeRequestForm = () => {
    setRequestAction(null);
    setRequestError("");
  };

  const handleSubmitRequest = async () => {
    if (!requestAction) return;
    const amountNum = Number(requestAmount);
    if (!requestAmount || amountNum <= 0) {
      setRequestError(fr ? "Veuillez saisir un montant valide." : "Please enter a valid amount.");
      return;
    }
    setRequestError("");
    setRequestSubmitting(true);
    try {
      await createTransactionRequest({
        type: requestAction.type,
        account_type: requestAction.accountType,
        amount: amountNum,
        notes: requestNotes || undefined,
      });
      setRequestSuccess(
        requestAction.type === "deposit"
          ? (fr ? "Demande de dépôt envoyée — en attente d'approbation." : "Deposit request submitted — awaiting approval.")
          : (fr ? "Demande de retrait envoyée — en attente d'approbation." : "Withdrawal request submitted — awaiting approval.")
      );
      setRequestAction(null);
      await loadData();
    } catch (err: any) {
      setRequestError(err?.message || (fr ? "Erreur lors de l'envoi de la demande." : "Error submitting request."));
    } finally {
      setRequestSubmitting(false);
    }
  };

  const displayName = profile?.profiles
    ? `${profile.profiles.first_name} ${profile.profiles.last_name}`
    : profile?.email || "";

  const recentTxns = transactions.slice(0, 5);
  const mainGoal = savingsGoals[0];
  const activeTontine = tontines[0]?.tontine ? { ...tontines[0].tontine, enrolled: tontines.length } : null;
  const goalPct = mainGoal ? Math.round((mainGoal.current_amount / mainGoal.target_amount) * 100) : 0;
  const currentAccount = (accounts.find((a) => a.account_type === "current")?.balance ?? 0);
  const savingsAccount = (accounts.find((a) => a.account_type === "savings")?.balance ?? 0);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {fr ? `Bonjour ${displayName}, bienvenue dans votre espace membre PIJ` : `Hello ${displayName}, welcome to your PIJ member space`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {fr ? "Voici un aperçu de vos activités" : "Here's an overview of your activities"}
        </p>
      </div>

      {/* KYC banner */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F0E8FF] border border-[#6E3A9A]/20">
        <AlertCircle size={16} color="#6E3A9A" className="shrink-0" />
        <p className="text-sm text-[#6E3A9A]">
          {fr ? "Votre compte est actif. " : "Your account is active. "}
          <button onClick={() => navigate("/tontines")} className="font-medium underline">{fr ? "Rejoindre une tontine →" : "Join a tontine →"}</button>
        </p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1E2530 0%, #2A3444 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#4CAF68", transform: "translate(30%, -30%)" }} />
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{fr ? "Compte Courant" : "Current Account"}</p>
          <p className="text-xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "Geist Mono, monospace" }}>
            {formatXAF(currentAccount)}
          </p>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <StatusBadge status="Active" size="sm" />
            <button onClick={() => openRequestForm("deposit", "current")} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
              <PlusCircle size={12} /> {fr ? "Déposer" : "Deposit"}
            </button>
            <button onClick={() => openRequestForm("withdrawal", "current")} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
              <MinusCircle size={12} /> {fr ? "Retirer" : "Withdraw"}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4CAF68 0%, #1F9D55 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "#FFFFFF", transform: "translate(30%, -30%)" }} />
          <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{fr ? "Compte Épargne" : "Savings Account"}</p>
          <p className="text-xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "Geist Mono, monospace" }}>
            {formatXAF(savingsAccount)}
          </p>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <StatusBadge status="Active" size="sm" />
            <button onClick={() => openRequestForm("deposit", "savings")} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-medium transition-colors">
              <PlusCircle size={12} /> {fr ? "Déposer" : "Deposit"}
            </button>
            <button onClick={() => openRequestForm("withdrawal", "savings")} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-medium transition-colors">
              <MinusCircle size={12} /> {fr ? "Retirer" : "Withdraw"}
            </button>
          </div>
        </div>


      </div>

      {requestSuccess && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
          <p className="text-sm text-[#1F9D55]">{requestSuccess}</p>
        </div>
      )}

      {requestAction && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-6">
          <h3 className="text-sm sm:text-base font-semibold mb-4">
            {requestAction.type === "deposit"
              ? (fr ? "Demande de dépôt" : "Deposit request")
              : (fr ? "Demande de retrait" : "Withdrawal request")}
            {" — "}
            {requestAction.accountType === "current" ? (fr ? "Compte courant" : "Current account") : (fr ? "Compte épargne" : "Savings account")}
          </h3>
          {requestError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{requestError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{fr ? "Montant (XAF)" : "Amount (XAF)"}</label>
              <input type="number" value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="10 000" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Note (optionnel)" : "Note (optional)"}</label>
              <input value={requestNotes} onChange={(e) => setRequestNotes(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
            </div>
            <div className="flex gap-2">
              <button onClick={closeRequestForm} disabled={requestSubmitting} className="flex-1 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all disabled:opacity-50">
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button onClick={handleSubmitRequest} disabled={requestSubmitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: requestAction.type === "deposit" ? "#4CAF68" : "#E5484D" }}>
                {requestSubmitting && <Loader2 size={14} className="animate-spin" />}
                {fr ? "Envoyer la demande" : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-6">
          <h3 className="text-sm sm:text-base font-semibold mb-4">{fr ? "Mes demandes" : "My requests"}</h3>
          <div className="space-y-2">
            {requests.slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {r.type === "deposit" ? (fr ? "Dépôt" : "Deposit") : (fr ? "Retrait" : "Withdrawal")}
                    {" · "}
                    {r.account_type === "current" ? (fr ? "Courant" : "Current") : (fr ? "Épargne" : "Savings")}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.submitted_at?.slice(0, 10)}</p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(r.amount)}</span>
                <StatusBadge status={r.status as any} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

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
                const isCredit = txn.type === "deposit";
                return (
                  <div key={txn.id} className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-border last:border-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
                      {isCredit ? <ArrowDownRight size={16} color="#4CAF68" /> : <ArrowUpRight size={16} color="#E5484D" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{txn.notes}</p>
                      <p className="text-xs text-muted-foreground">{txn.created_at} · {txn.account_type}</p>
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
          {mainGoal ? (
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Objectif principal" : "Main goal"}</h3>
              <button onClick={() => navigate("/savings")} className="text-xs text-[#4CAF68] font-medium hover:underline shrink-0">{fr ? "Voir tout" : "View all"}</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl sm:text-2xl">🎯</span>
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
                <span className="font-medium text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.current_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fr ? "Objectif" : "Target"}</span>
                <span className="font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.target_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fr ? "Restant" : "Remaining"}</span>
                <span className="font-medium text-[#E5484D]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mainGoal.target_amount - mainGoal.current_amount)}</span>
              </div>
            </div>
          </div>

          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">{fr ? "Aucun objectif d'épargne défini" : "No savings goal set"}</p>
              <button onClick={() => navigate("/savings")} className="mt-3 text-sm text-[#4CAF68] font-medium hover:underline">{fr ? "Créer un objectif" : "Create a goal"}</button>
            </div>
          )}
          {/* Tontine Summary */}
          {activeTontine ? (
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
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} />
                {fr ? "Début:" : "Start:"} {activeTontine.start_date}
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activeTontine.enrolled} {fr ? "membres" : "members"}</span>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">{fr ? "Aucune tontine active" : "No active tontine"}</p>
              <button onClick={() => navigate("/marketplace")} className="mt-3 text-sm text-[#4CAF68] font-medium hover:underline">{fr ? "Rejoindre une tontine" : "Join a tontine"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
