import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Loader2, Check, Landmark } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { fetchLoans, updateLoan } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

export default function AdminLoans() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState("");

  const load = () => fetchLoans().then(setLoans).catch(() => setError(true)).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleMarkRepaid = async (loan: any) => {
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

  const memberName = (loan: any) => {
    const profile = loan.users?.profiles;
    return profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : (loan.users?.email ?? "—");
  };

  if (loading) {
    return <div className="p-4 lg:p-6 flex items-center justify-center"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (error) {
    return <div className="p-4 lg:p-6"><p className="text-red-500">{fr ? "Erreur de chargement" : "Error loading data"}</p></div>;
  }

  const outstanding = loans.filter((l) => !l.is_repaid).length;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2"><ArrowLeft size={20} className="text-muted-foreground" /></button>
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Prêt & Financement" : "Loan & Financing"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{loans.length} {fr ? "prêt(s)" : "loan(s)"} · {outstanding} {fr ? "en cours" : "outstanding"}</p>
      </div>

      {decisionError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{decisionError}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loans.length === 0 ? (
          <div className="p-10 text-center">
            <Landmark size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{fr ? "Aucun prêt enregistré" : "No loans recorded"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <th className="px-5 py-3 text-left">{fr ? "Membre" : "Member"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Montant" : "Amount"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Intérêt" : "Interest"}</th>
                  <th className="px-5 py-3 text-left">{fr ? "Date du prêt" : "Loan date"}</th>
                  <th className="px-5 py-3 text-left">{fr ? "Remboursement" : "Repayment"}</th>
                  <th className="px-5 py-3 text-center">{fr ? "Statut" : "Status"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4 text-sm font-medium">{memberName(loan)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(loan.amount)}</td>
                    <td className="px-5 py-4 text-right text-sm" style={{ fontFamily: "Geist Mono, monospace" }}>{loan.interest}%</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{loan.loan_date}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{loan.repayment_date}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge status={loan.is_repaid ? "Paid" : "Pending"} size="sm" /></td>
                    <td className="px-5 py-4 text-right">
                      {!loan.is_repaid ? (
                        <button
                          onClick={() => handleMarkRepaid(loan)}
                          disabled={decidingId === loan.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-all ml-auto"
                          style={{ background: "#4CAF68" }}
                        >
                          {decidingId === loan.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          {fr ? "Marquer remboursé" : "Mark repaid"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
