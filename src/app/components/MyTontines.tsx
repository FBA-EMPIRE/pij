import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronRight, Users, Calendar, Trophy, Archive, Clock } from "lucide-react";
import { formatXAF } from "../lib/format";
import { fetchMyTontines, getCurrentUserId } from "../lib/supabase/queries";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function MyTontines() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [myTontines, setMyTontines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserId().then(uid => {
      if (uid) fetchMyTontines(uid).then(setMyTontines).finally(() => setLoading(false));
      else setLoading(false);
    });
  }, []);

  const myActiveTontines = myTontines.filter(
    (item) => item.tontines?.status !== "Completed" && item.tontines?.status !== "Archived"
  );
  const myCompletedTontines = myTontines.filter(
    (item) => item.tontines?.status === "Completed" || item.tontines?.status === "Archived"
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Mes Tontines" : "My Tontines"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{fr ? "Toutes les tontines auxquelles vous participez." : "All tontines you are participating in."}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "active", label: fr ? "Actives" : "Active" },
          { key: "completed", label: fr ? "Terminées" : "Completed" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tontines */}
      {tab === "active" && (
        <>
          {myActiveTontines.length > 0 ? (
            <div className="space-y-3">
              {myActiveTontines.map((item) => {
                const t = item.tontines;
                const pct = t?.current_week > 0 ? Math.round((t.current_week / t.total_weeks) * 100) : 0;
                return (
                  <div
                    key={t.id}
                    className="bg-card rounded-2xl border border-border p-4 sm:p-5 hover:border-[#4CAF68]/40 cursor-pointer transition-all"
                    onClick={() => navigate(`/tontines/${t.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t?.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{t?.tontine_types?.name ?? t?.frequency ?? ""} · {fr ? "Début:" : "Started:"} {t?.start_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={t.status as any} size="sm" />
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="bg-muted/30 rounded-xl p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Votre position" : "Your position"}</p>
                        <p className="text-xs sm:text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>#{item.position ?? 1}</p>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Membres" : "Members"}</p>
                        <p className="text-xs sm:text-sm font-bold flex items-center gap-1" style={{ fontFamily: "Geist Mono, monospace" }}>
                          <Users size={12} /> {t.enrolled}/{t.capacity}
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-2 sm:p-3 col-span-2 sm:col-span-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Pot du tour" : "Round pool"}</p>
                        <p className="text-xs sm:text-sm font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(t.pool_amount)}</p>
                      </div>
                    </div>
                    {t.current_week > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">{fr ? "Semaine" : "Week"} {t.current_week}/{t.total_weeks}</span>
                          <span className="font-medium text-[#4CAF68]">{pct}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#4CAF68]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Trophy size={14} color="#F2994A" />
                      <p className="text-xs text-[#F2994A] font-medium">{fr ? "Vous avez reçu votre paiement (Tour 1)" : "You received your payout (Round 1)"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{fr ? "Aucune tontine active" : "No active tontines"}</p>
            </div>
          )}

          <div className="mt-6 p-5 rounded-2xl border-2 border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">{fr ? "Rejoignez une autre tontine pour maximiser vos gains." : "Join another tontine to maximize your savings."}</p>
            <button onClick={() => navigate("/marketplace")} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
              {fr ? "Explorer le marketplace" : "Explore marketplace"}
            </button>
          </div>
        </>
      )}

      {/* Completed tontines */}
      {tab === "completed" && (
        myCompletedTontines.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Archive size={32} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{fr ? "Aucune tontine terminée" : "No completed tontines"}</p>
            <button onClick={() => navigate("/marketplace")} className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
              {fr ? "Rejoindre une tontine" : "Join a tontine"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myCompletedTontines.map((item) => {
              const t = item.tontines;
              return (
                <div
                  key={item.tontine_id}
                  className="bg-card rounded-2xl border border-border p-4 sm:p-5 hover:border-[#4CAF68]/40 cursor-pointer transition-all"
                  onClick={() => navigate(`/tontines/archives/${item.tontine_id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{t?.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t?.start_date ?? ""} · {t?.total_weeks ?? "?"} {fr ? "semaines" : "weeks"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status="Completed" size="sm" />
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                    <div className="bg-muted/30 rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Position" : "Position"}</p>
                      <p className="text-xs sm:text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>#{item.position ?? "?"}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Contributions" : "Contributions"}</p>
                      <p className="text-xs sm:text-sm font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>
                        {(item.contributions?.filter(Boolean)?.length ?? 0)}/{item.contributions?.length ?? "?"}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{fr ? "Paiement" : "Payout"}</p>
                      <p className="text-xs sm:text-sm font-bold">{item.payout_received ? <span className="text-[#F2994A]">🏆 {fr ? "Reçu" : "Received"}</span> : "—"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
