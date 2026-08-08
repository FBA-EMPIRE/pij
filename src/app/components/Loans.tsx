import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Loader2, Check, Landmark } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { createLoan, fetchLoans, updateLoan } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

interface LoansProps {
  view?: "list" | "detail";
}

export default function Loans({ view = "list" }: LoansProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const { id } = useParams();

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [loanDate, setLoanDate] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState("");

  const load = () => fetchLoans().then(setLoans).catch(() => setError(true)).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    setSubmitError("");
    if (!amount || Number(amount) <= 0) {
      setSubmitError(fr ? "Veuillez saisir un montant valide." : "Please enter a valid amount.");
      return;
    }
    if (!loanDate || !repaymentDate) {
      setSubmitError(fr ? "Veuillez renseigner les deux dates." : "Please provide both dates.");
      return;
    }
    setSubmitting(true);
    try {
      await createLoan({
        amount: Number(amount),
        interest: interest ? Number(interest) : 0,
        loan_date: loanDate,
        repayment_date: repaymentDate,
      });
      setShowForm(false);
      setAmount(""); setInterest(""); setLoanDate(""); setRepaymentDate("");
      await load();
    } catch (err: any) {
      setSubmitError(err?.message || (fr ? "Erreur lors de la demande." : "Error submitting the application."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRepaid = async (loan: any) => {
    setDecisionError("");
    setDecidingId(loan.id);
    try {
      await updateLoan({ loan_id: loan.id, is_repaid: !loan.is_repaid });
      await load();
    } catch (err: any) {
      setDecisionError(err?.message || (fr ? "Erreur lors de la mise à jour." : "Error updating the loan."));
    } finally {
      setDecidingId(null);
    }
  };

  if (loading) {
    return <div className="p-4 lg:p-8 flex items-center justify-center"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (error) {
    return <div className="p-4 lg:p-8"><p className="text-red-500">{fr ? "Erreur de chargement" : "Error loading data"}</p></div>;
  }

  if (view === "detail") {
    const loan = loans.find((l: any) => l.id === id);
    if (!loan) {
      return (
        <div className="p-4 lg:p-8 max-w-2xl mx-auto">
          <button onClick={() => navigate("/loans")} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button>
          <p className="text-muted-foreground">{fr ? "Prêt introuvable" : "Loan not found"}</p>
        </div>
      );
    }
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <button onClick={() => navigate("/loans")} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Détail du prêt" : "Loan detail"}</h1>
          <StatusBadge status={loan.is_repaid ? "Paid" : "Pending"} size="sm" />
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Montant du prêt" : "Loan amount"}</p>
              <p className="text-lg font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(loan.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Intérêt" : "Interest"}</p>
              <p className="text-lg font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{loan.interest}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Date du prêt" : "Loan date"}</p>
              <p className="text-sm font-medium mt-0.5">{loan.loan_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Date de remboursement" : "Repayment date"}</p>
              <p className="text-sm font-medium mt-0.5">{loan.repayment_date}</p>
            </div>
          </div>
          {loan.result && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{fr ? "Résultat" : "Result"}</p>
              <p className="text-sm">{loan.result}</p>
            </div>
          )}
          {decisionError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{decisionError}</div>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-2 border-t border-border">
            <input type="checkbox" checked={!!loan.is_repaid} disabled={decidingId === loan.id} onChange={() => handleToggleRepaid(loan)} className="rounded border-border accent-[#4CAF68]" />
            {fr ? "Remboursé" : "Repaid"}
            {decidingId === loan.id && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2"><ArrowLeft size={20} className="text-muted-foreground" /></button>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Prêt & Financement" : "Loan & Financing"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{fr ? "Suivez vos prêts et leur statut de remboursement." : "Track your loans and their repayment status."}</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Nouvelle demande" : "New application"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-6 space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{submitError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{fr ? "Montant du prêt (XAF)" : "Loan amount (XAF)"}</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="100 000" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Intérêt (%)" : "Interest (%)"}</label>
              <input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="5" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Date du prêt" : "Loan date"}</label>
              <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Date de remboursement" : "Repayment date"}</label>
              <input type="date" value={repaymentDate} onChange={(e) => setRepaymentDate(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all disabled:opacity-50">{fr ? "Annuler" : "Cancel"}</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: "#4CAF68" }}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {fr ? "Envoyer la demande" : "Submit application"}
            </button>
          </div>
        </div>
      )}

      {decisionError && !showForm && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{decisionError}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loans.length === 0 ? (
          <div className="p-10 text-center">
            <Landmark size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{fr ? "Aucun prêt pour le moment" : "No loans yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {loans.map((loan: any) => (
              <div key={loan.id} className="flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/loans/${loan.id}`)}>
                  <p className="text-sm font-medium">{formatXAF(loan.amount)} <span className="text-xs text-muted-foreground font-normal">· {loan.interest}% {fr ? "intérêt" : "interest"}</span></p>
                  <p className="text-xs text-muted-foreground">{fr ? "Du" : "From"} {loan.loan_date} {fr ? "au" : "to"} {loan.repayment_date}</p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={!!loan.is_repaid} disabled={decidingId === loan.id} onChange={() => handleToggleRepaid(loan)} className="rounded border-border accent-[#4CAF68]" />
                  {fr ? "Remboursé" : "Repaid"}
                </label>
                <StatusBadge status={loan.is_repaid ? "Paid" : "Pending"} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
