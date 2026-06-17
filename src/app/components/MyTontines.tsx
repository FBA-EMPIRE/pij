import { useNavigate } from "react-router";
import { ChevronRight, Users, Calendar, Trophy } from "lucide-react";
import { TONTINES, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface MyTontinesProps {
  lang?: "fr" | "en";
}

export default function MyTontines({ lang = "fr" }: MyTontinesProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Mes Tontines" : "My Tontines"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{fr ? "Toutes les tontines auxquelles vous participez." : "All tontines you are participating in."}</p>
      </div>

      <div className="space-y-3">
        {[TONTINES[0]].map((t) => {
          const pct = Math.round((t.current_week / t.total_weeks) * 100);
          return (
            <div
              key={t.id}
              className="bg-card rounded-2xl border border-border p-5 hover:border-[#4CAF68]/40 cursor-pointer transition-all"
              onClick={() => navigate(`/tontines/${t.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.type} · {fr ? "Début:" : "Started:"} {t.start_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status as any} size="sm" />
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{fr ? "Votre position" : "Your position"}</p>
                  <p className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>#1</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{fr ? "Membres" : "Members"}</p>
                  <p className="text-sm font-bold flex items-center gap-1" style={{ fontFamily: "Geist Mono, monospace" }}>
                    <Users size={12} /> {t.enrolled}/{t.capacity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{fr ? "Pot du tour" : "Round pool"}</p>
                  <p className="text-sm font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.pool_amount)}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{fr ? "Semaine" : "Week"} {t.current_week}/{t.total_weeks}</span>
                  <span className="font-medium text-[#4CAF68]">{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#4CAF68]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Trophy size={14} color="#F2994A" />
                <p className="text-xs text-[#F2994A] font-medium">{fr ? "Vous avez reçu votre paiement (Tour 1)" : "You received your payout (Round 1)"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-5 rounded-2xl border-2 border-dashed border-border text-center">
        <p className="text-sm text-muted-foreground mb-3">{fr ? "Rejoignez une autre tontine pour maximiser vos gains." : "Join another tontine to maximize your savings."}</p>
        <button onClick={() => navigate("/marketplace")} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
          {fr ? "Explorer le marketplace" : "Explore marketplace"}
        </button>
      </div>
    </div>
  );
}
