import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, CheckCircle, TrendingUp, Eye, Loader2 } from "lucide-react";
import { fetchTontineById, fetchTontineMembers } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function AdminTontineDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [t, m] = await Promise.all([
          fetchTontineById(id),
          fetchTontineMembers(id),
        ]);
        setTontine(t);
        setMembers(m);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (error || !tontine) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
        </button>
        <p className="text-muted-foreground">{fr ? "Tontine introuvable" : "Tontine not found"}</p>
      </div>
    );
  }

  const pct = tontine.current_week > 0 ? Math.round((tontine.current_week / tontine.total_weeks) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{tontine.name}</h2>
            <StatusBadge status={tontine.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{tontine.tontine_types?.name || tontine.type} · {tontine.duration} · {fr ? "Début" : "Start"}: {tontine.start_date}</p>
          {tontine.description && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{tontine.description}</p>}
        </div>
        <div className="flex gap-2">
          {(tontine.status === "In Progress" || tontine.status === "Open") && (
            <button onClick={() => navigate(`/admin/tontines/${tontine.id}/participants`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Users size={13} /> {fr ? "Participants" : "Participants"}
            </button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.contribution)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Membres" : "Members"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{tontine.enrolled || 0}/{tontine.capacity}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.entry_fee || 0)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Pot par tour" : "Pool/round"}</p>
          <p className="text-lg font-bold mt-1 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.pool_amount || 0)}</p>
        </div>
      </div>

      {/* Progress */}
      {tontine.current_week > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{fr ? "Progression" : "Progress"}</span>
            <span className="font-medium text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>
              {fr ? "Tour" : "Round"} {tontine.current_week}/{tontine.total_weeks}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="h-2.5 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-card rounded-2xl border border-border mb-6">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            {fr ? "Participants" : "Participants"} ({members.length})
          </h3>
        </div>
        {members.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">{fr ? "Aucun participant" : "No participants"}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <th className="px-5 py-3 text-left">{fr ? "Utilisateur" : "User"}</th>
                  <th className="px-5 py-3 text-left">{fr ? "Email" : "Email"}</th>
                  <th className="px-5 py-3 text-center">{fr ? "Statut" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(m.users?.full_name || m.users?.name || m.users?.email || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium">{m.users?.full_name || m.users?.name || m.users?.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{m.users?.email || "—"}</td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={m.status || "active"} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout rounds */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          {fr ? "Tours de paiement" : "Payout rounds"}
        </h3>
        <p className="text-sm text-muted-foreground">{fr ? "Aucun paiement effectué" : "No payouts made yet"}</p>
      </div>

      {/* Audit trail */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">{fr ? "Journal d'audit" : "Audit trail"}</h3>
        <p className="text-sm text-muted-foreground">{fr ? "Aucune entrée d'audit pour cette tontine" : "No audit entries for this tontine"}</p>
      </div>
    </div>
  );
}
