import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Users, CheckCircle, XCircle, Eye } from "lucide-react";
import { TONTINES, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface AdminTontinesProps {
  lang?: "fr" | "en";
}

export default function AdminTontines({ lang = "fr" }: AdminTontinesProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [tab, setTab] = useState<"list" | "create">("list");

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Tontines" : "Tontine Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{TONTINES.length} {fr ? "tontines" : "tontines"}</p>
        </div>
        <button onClick={() => setTab("create")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Créer une tontine" : "Create tontine"}
        </button>
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
          {TONTINES.map((t) => {
            const pct = t.current_week > 0 ? Math.round((t.current_week / t.total_weeks) * 100) : 0;
            return (
              <div key={t.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t.name}</h3>
                      <StatusBadge status={t.status as any} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t.type} · {t.duration} · {fr ? "Début:" : "Start:"} {t.start_date}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
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
                    <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{t.enrolled}/{t.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.entry_fee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{fr ? "Pot par tour" : "Pool/round"}</p>
                    <p className="text-sm font-bold mt-0.5 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.pool_amount)}</p>
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

                {/* Contribution matrix for active tontines */}
                {t.members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-3">{fr ? "Grille des contributions (semaine actuelle)" : "Contribution grid (current week)"}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.members.map((m) => {
                        const latestPaid = m.contributions[t.current_week - 1] ?? false;
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${latestPaid ? "bg-[#E8F5EC] text-[#1F9D55]" : "bg-red-50 text-[#E5484D]"}`}
                            title={m.name}
                          >
                            {latestPaid ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            {m.avatar}
                          </div>
                        );
                      })}
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
          <div>
            <label className="text-sm font-medium">{fr ? "Nom de la tontine" : "Tontine name"}</label>
            <input className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={fr ? "Ex: Tontine Entrepreneurs Yaoundé" : "E.g. Tontine Entrepreneurs Yaoundé"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{fr ? "Fréquence" : "Frequency"}</label>
              <select className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                <option>{fr ? "Hebdomadaire" : "Weekly"}</option>
                <option>{fr ? "Mensuel" : "Monthly"}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Capacité" : "Capacity"}</label>
              <input type="number" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="12" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{fr ? "Cotisation (XAF)" : "Contribution (XAF)"}</label>
              <input type="number" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="75 000" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Frais d'entrée (XAF)" : "Entry fee (XAF)"}</label>
              <input type="number" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="25 000" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Date de début" : "Start date"}</label>
            <input type="date" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Description" : "Description"}</label>
            <textarea rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" placeholder={fr ? "Décrivez l'objectif de cette tontine..." : "Describe the purpose of this tontine..."} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setTab("list")} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button>
            <button onClick={() => setTab("list")} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>{fr ? "Créer la tontine" : "Create tontine"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
