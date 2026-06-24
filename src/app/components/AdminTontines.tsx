import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, CheckCircle, XCircle, Eye, Archive, Loader2 } from "lucide-react";
import { fetchTontines } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function AdminTontines() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<"list" | "create">("list");
  const [tontines, setTontines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTontines();
        setTontines(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-red-500">{fr ? "Erreur de chargement" : "Error loading tontines"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Tontines" : "Tontine Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tontines.length} {fr ? "tontines" : "tontines"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/admin/tontine-types")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Archive size={16} /> {fr ? "Types" : "Types"}
          </button>
          <button onClick={() => navigate("/admin/tontines/archives")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Archive size={16} /> {fr ? "Archives" : "Archives"}
          </button>
          <button onClick={() => setTab("create")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
            <Plus size={16} /> {fr ? "Créer une tontine" : "Create tontine"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "list", label: fr ? "Liste des tontines" : "Tontine list" },
          { key: "create", label: fr ? "Créer une tontine" : "Create tontine" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <div className="space-y-4">
          {tontines.map((t: any) => {
            const pct = t.current_week > 0 ? Math.round((t.current_week / t.total_weeks) * 100) : 0;
            return (
              <div key={t.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t.name}</h3>
                      <StatusBadge status={t.status as any} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t.tontine_types?.name || t.type} · {t.duration} · {fr ? "Début:" : "Start:"} {t.start_date}</p>
                  </div>
                  <button onClick={() => navigate(`/admin/tontines/${t.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye size={13} /> {fr ? "Détails" : "Details"}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.contribution)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Membres" : "Members"}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{t.enrolled || 0}/{t.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.entry_fee || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Pot par tour" : "Pool/round"}</p>
                    <p className="text-sm font-bold mt-0.5 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.pool_amount || 0)}</p>
                  </div>
                </div>

                {t.current_week > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{fr ? "Semaine" : "Week"} {t.current_week}/{t.total_weeks}</span>
                      <span className="font-medium text-[#4CAF68]">{pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#4CAF68]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "create" && (
        <div className="max-w-lg bg-card rounded-2xl border border-border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">{fr ? "Création de tontine via l'interface à implémenter avec les appels API" : "Tontine creation via UI to be implemented with API calls"}</p>
        </div>
      )}
    </div>
  );
}
