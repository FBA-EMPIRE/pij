import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, Calendar, Coins, ArrowRight, Inbox } from "lucide-react";
import { formatXAF } from "../lib/format";
import { fetchTontines } from "../lib/supabase/queries";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function TontineMarketplace() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tontines, setTontines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTontines()
      .then(setTontines)
      .finally(() => setLoading(false));
  }, []);

  const openTontines = tontines.filter((t) => t.status === "Open");

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Marketplace des Tontines" : "Tontine Marketplace"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{fr ? "Rejoignez une tontine disponible et commencez à épargner collectivement." : "Join an available tontine and start saving collectively."}</p>
      </div>

      {openTontines.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Aucune tontine ouverte" : "No open tontines"}</h3>
          <p className="text-sm text-muted-foreground">{fr ? "Revenez plus tard pour découvrir de nouvelles opportunités." : "Check back later for new opportunities."}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {openTontines.map((t) => {
          const fillPct = Math.round((t.enrolled / t.capacity) * 100);
          const status = t.status as any;
          return (
            <div key={t.id} className="bg-card rounded-2xl border border-border p-4 sm:p-6 hover:border-[#4CAF68]/40 transition-all group">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base truncate" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.tontine_types?.name ?? t.frequency ?? ""} · {t.duration}</p>
                </div>
                <StatusBadge status={status} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 leading-relaxed line-clamp-2 sm:line-clamp-none">{t.description}</p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="bg-muted/40 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{fr ? "Cotisation" : "Contribution"}</p>
                  <p className="text-xs sm:text-sm font-bold truncate" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.contribution)}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{fr ? "Frais d'entrée" : "Entry fee"}</p>
                  <p className="text-xs sm:text-sm font-bold truncate" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.entry_fee)}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{fr ? "Pot par tour" : "Pool per round"}</p>
                  <p className="text-xs sm:text-sm font-bold text-[#4CAF68] truncate" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.pool_amount)}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{fr ? "Début" : "Start date"}</p>
                  <p className="text-xs sm:text-sm font-bold truncate">{t.start_date}</p>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users size={11} />
                    {t.enrolled} / {t.capacity} {fr ? "membres" : "members"}
                  </div>
                  <span className="font-medium" style={{ color: fillPct >= 90 ? "#F2994A" : "#4CAF68" }}>{fillPct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "#F2994A" : "#4CAF68" }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate(`/tontines/${t.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-[#4CAF68] text-[#4CAF68] hover:bg-[#4CAF68] hover:text-white transition-all"
              >
                {fr ? "Rejoindre cette tontine" : "Join this tontine"}
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
