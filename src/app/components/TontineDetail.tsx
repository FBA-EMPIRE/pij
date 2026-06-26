import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Users, Calendar, Coins, Info, Send, Clock, UserPlus } from "lucide-react";
import { formatXAF } from "../lib/format";
import { fetchTontineById, fetchTontineMembers, getCurrentUserId, applyToTontine } from "../lib/supabase/queries";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function TontineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [activeTab, setActiveTab] = useState<"grid" | "members" | "rounds">("grid");
  const [requestSent, setRequestSent] = useState(false);
  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getCurrentUserId().then(setCurrentUserId);
    Promise.all([
      fetchTontineById(id),
      fetchTontineMembers(id),
    ]).then(([t, m]) => {
      setTontine(t);
      setMembers(m);
    }).finally(() => setLoading(false));
  }, [id]);

  const weeks = tontine ? Array.from({ length: tontine.total_weeks }, (_, i) => i + 1) : [];

  const mappedMembers = members.map(m => {
    const name = m.users?.full_name ?? m.users?.email ?? "User";
    return {
      id: m.id,
      name,
      avatar: name.charAt(0).toUpperCase(),
      position: m.position,
      contributions: m.contributions ?? [],
      payout_received: m.payout_received ?? false,
    };
  });

  const userIsMember = currentUserId ? members.some((m) => m.user_id === currentUserId) : false;
  const showJoinButton = tontine?.status === "Open" && !userIsMember && !requestSent;
  const fillPct = tontine?.capacity > 0 ? Math.round(((tontine.enrolled ?? 0) / tontine.capacity) * 100) : 0;

  const handleRequestJoin = async () => {
    if (!currentUserId || !id) return;
    try {
      await applyToTontine({ user_id: currentUserId, tontine_id: id });
      setRequestSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">{fr ? "Chargement..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!tontine) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} />
        </button>
        <p className="text-muted-foreground">{fr ? "Tontine introuvable" : "Tontine not found"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{tontine.name}</h2>
            <StatusBadge status={tontine.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{tontine.tontine_types?.name ?? tontine.frequency ?? ""} · {tontine.duration}</p>
        </div>
      </div>

      {/* General Information */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Informations générales" : "General Information"}</h3>
        <p className="text-sm text-muted-foreground mb-4">{tontine.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
            <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.contribution)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
            <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.entry_fee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Participants" : "Participants"}</p>
            <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{tontine.capacity}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Date de début" : "Start date"}</p>
            <p className="text-sm font-bold mt-0.5">{tontine.start_date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Fréquence" : "Frequency"}</p>
            <p className="text-sm font-bold mt-0.5">{tontine.tontine_types?.name ?? tontine.frequency ?? ""}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Durée" : "Duration"}</p>
            <p className="text-sm font-bold mt-0.5">{tontine.duration}</p>
          </div>
        </div>
      </div>

      {/* Statistics + Join Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Places disponibles" : "Available slots"}</p>
          <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>
            {tontine.capacity - tontine.enrolled} <span className="text-sm font-normal text-muted-foreground">/ {tontine.capacity}</span>
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="h-2 rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "#F2994A" : "#4CAF68" }} />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Participants inscrits" : "Participants joined"}</p>
          <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{tontine.enrolled}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Gain attendu" : "Expected payout"}</p>
          <p className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.pool_amount)}</p>
        </div>
      </div>

      {requestSent && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
          <Send size={16} color="#4CAF68" />
          <p className="text-sm text-[#1F9D55]">{fr ? "Demande envoyée avec succès !" : "Request sent successfully!"}</p>
        </div>
      )}

      {/* Join Button */}
      {showJoinButton && (
        <button onClick={handleRequestJoin} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all mb-6" style={{ background: "#4CAF68" }}>
          <UserPlus size={18} /> {fr ? "Demander à rejoindre" : "Request To Join"}
        </button>
      )}

      {/* Participant Preview (for non-members viewing an Open tontine) */}
      {mappedMembers.length > 0 && !userIsMember && (
        <div className="bg-card rounded-2xl border border-border mb-6 p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            {fr ? "Aperçu des participants" : "Participant Preview"}
          </h3>
          <div className="space-y-2">
            {mappedMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-6" style={{ fontFamily: "Geist Mono, monospace" }}>#{m.position}</span>
                <div className="w-7 h-7 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
                <span className="font-medium">{m.name}</span>
                <div className="ml-auto">
                  <StatusBadge status={m.payout_received ? "Paid" : "Active"} size="sm" />
                </div>
              </div>
            ))}
            {mappedMembers.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{mappedMembers.length - 5} {fr ? "autres participants" : "more participants"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cycle progression */}
      {tontine.current_week > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Progression du cycle" : "Cycle progression"}</h3>
            <span className="text-sm font-medium text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>
              {Math.round((tontine.current_week / tontine.total_weeks) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {weeks.map((w) => (
              <div
                key={w}
                className={`flex-1 h-2 rounded-full transition-all ${
                  w < tontine.current_week ? "bg-[#4CAF68]" :
                  w === tontine.current_week ? "bg-[#F2994A]" :
                  "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fr ? "Début" : "Start"} {tontine.start_date}</span>
            <span className="text-[#F2994A] font-medium">{fr ? "Tour" : "Round"} {tontine.current_week} / {tontine.total_weeks}</span>
            <span>{fr ? "Fin dans" : "Ends in"} {tontine.total_weeks - tontine.current_week} {fr ? "semaines" : "weeks"}</span>
          </div>
        </div>
      )}

      {/* Tabs - only for members */}
      {userIsMember && (
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0 mb-6">
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-max sm:w-full mx-4 sm:mx-0">
              {[
                { key: "grid", label: fr ? "Grille" : "Grid" },
                { key: "members", label: fr ? "Participants" : "Members" },
                { key: "rounds", label: fr ? "Historique" : "History" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* === CONTRIBUTION GRID === */}
          {activeTab === "grid" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Grille de suivi" : "Contribution grid"}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{fr ? "Contributions hebdomadaires" : "Weekly contributions"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#4CAF68]" />
                    <span className="text-muted-foreground">{fr ? "Payé" : "Paid"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#E5484D]/20 border border-[#E5484D]/30" />
                    <span className="text-muted-foreground">{fr ? "Non payé" : "Unpaid"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} color="#F2994A" className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-muted-foreground">{fr ? "Paiement reçu" : "Payout received"}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto p-2 sm:p-4 touch-pan-x">
                <div className="flex gap-1 sm:gap-1.5 mb-2 ml-32 sm:ml-44">
                  {weeks.map((w) => (
                    <div
                      key={w}
                      className={`w-7 sm:w-10 text-center text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                        w === tontine.current_week ? "text-[#F2994A]" : "text-muted-foreground"
                      }`}
                      style={{ fontFamily: "Geist Mono, monospace" }}
                    >
                      S{w}
                    </div>
                  ))}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  {mappedMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-1 sm:gap-1.5">
                      <div className="w-32 sm:w-44 flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 pr-1 sm:pr-2">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold" style={{ background: member.payout_received ? "#F2994A" : "#6E3A9A" }}>
                            {member.avatar}
                          </div>
                          {member.payout_received && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#F2994A] flex items-center justify-center">
                              <Trophy size={6} color="white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium truncate">{member.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">#{member.position}</p>
                        </div>
                      </div>

                      {member.contributions.map((paid, wi) => {
                        const isCurrent = wi + 1 === tontine.current_week;
                        const isFuture = wi + 1 > tontine.current_week;
                        return (
                          <div
                            key={wi}
                            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 transition-all
                              ${isFuture
                                ? "bg-muted/40 text-muted-foreground/30"
                                : paid
                                  ? "bg-[#4CAF68] text-white shadow-sm"
                                  : "bg-[#E5484D]/12 border border-[#E5484D]/25 text-[#E5484D]"
                              }
                              ${isCurrent && !isFuture ? "ring-1 sm:ring-2 ring-[#F2994A]/50" : ""}
                            `}
                            title={paid ? (fr ? "Payé" : "Paid") : (isFuture ? (fr ? "À venir" : "Upcoming") : (fr ? "Non payé" : "Unpaid"))}
                          >
                            {isFuture ? (
                              <span>·</span>
                            ) : paid ? (
                              <CheckCircle size={10} className="sm:w-[14px] sm:h-[14px]" />
                            ) : (
                              <XCircle size={10} className="sm:w-[13px] sm:h-[13px]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 px-1">
                  <Info size={13} className="text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {fr
                      ? `Tous les membres peuvent voir ce tableau. Transparence totale sur les contributions de chaque participant.`
                      : `All members can see this table. Full transparency on each participant's contributions.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* === PARTICIPANTS === */}
          {activeTab === "members" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Liste des participants" : "Participant list"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{tontine.enrolled} {fr ? "membres inscrits" : "enrolled members"}</p>
              </div>
              <div>
                <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">{fr ? "Membre" : "Member"}</div>
                  <div className="col-span-3 text-center">{fr ? "Contributions" : "Contributions"}</div>
                  <div className="col-span-3 text-center">{fr ? "Statut" : "Status"}</div>
                </div>
                {mappedMembers.map((member) => {
                  const paidCount = member.contributions.filter(Boolean).length;
                  const totalDue = tontine.current_week;
                  return (
                    <div key={member.id} className="grid grid-cols-2 sm:grid-cols-12 items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b border-border last:border-0 hover:bg-muted/20">
                      <div className="hidden sm:flex col-span-1">
                        <span className="text-sm font-medium text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{member.position}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-5 flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0" style={{ background: "#6E3A9A" }}>
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium truncate">{member.name}</p>
                          <p className="sm:hidden text-[10px] text-muted-foreground">#{member.position}</p>
                          {member.payout_received && (
                            <div className="hidden sm:flex items-center gap-1 mt-0.5">
                              <Trophy size={11} color="#F2994A" />
                              <span className="text-xs text-[#F2994A]">{fr ? "Tour reçu" : "Round Received"} 🏆</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 sm:col-span-3 flex flex-col sm:block text-right sm:text-center">
                        <span className="text-[10px] sm:hidden text-muted-foreground">{fr ? "Contr." : "Contr."} </span>
                        <span className={`text-xs sm:text-sm font-bold ${paidCount === totalDue ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                          {paidCount}/{totalDue}
                        </span>
                      </div>
                      <div className="hidden sm:flex col-span-3 justify-center">
                        {paidCount === totalDue ? (
                          <StatusBadge status="Paid" size="sm" />
                        ) : (
                          <StatusBadge status="Unpaid" size="sm" />
                        )}
                      </div>
                      {paidCount !== totalDue && (
                        <div className="sm:hidden col-span-2 text-right">
                          <span className="text-[10px] text-[#E5484D] font-medium">{fr ? "En retard" : "Late"}</span>
                        </div>
                      )}
                      {member.payout_received && (
                        <div className="sm:hidden col-span-2 flex items-center justify-end gap-1">
                          <Trophy size={10} color="#F2994A" />
                          <span className="text-[10px] text-[#F2994A]">{fr ? "Reçu" : "Paid"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === ROUNDS HISTORY === */}
          {activeTab === "rounds" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Historique des tours" : "Round history"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{fr ? "Ordre de distribution des paiements" : "Payment distribution order"}</p>
              </div>
              <div>
                {mappedMembers.map((member, i) => {
                  const weekNum = i + 1;
                  const done = weekNum < tontine.current_week;
                  const current = weekNum === tontine.current_week;
                  return (
                    <div key={member.id} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 border-b border-border last:border-0">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${done ? "bg-[#4CAF68] text-white" : current ? "bg-[#F2994A] text-white" : "bg-muted text-muted-foreground"}`}>
                        {done ? <Trophy size={12} className="sm:w-[14px] sm:h-[14px]" /> : weekNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{member.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {fr ? "Semaine" : "Week"} {weekNum} · {done ? (fr ? "Distribué" : "Paid") : current ? (fr ? "En cours" : "Current") : (fr ? "À venir" : "Upcoming")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace", color: done ? "#1F9D55" : current ? "#F2994A" : "var(--muted-foreground)" }}>
                          {done || current ? formatXAF(tontine.pool_amount) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
