import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Users, Calendar, Coins, Info } from "lucide-react";
import { TONTINES, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface TontineDetailProps {
  lang?: "fr" | "en";
}

export default function TontineDetail({ lang = "fr" }: TontineDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [activeTab, setActiveTab] = useState<"grid" | "members" | "rounds">("grid");

  const tontine = TONTINES.find((t) => t.id === id) ?? TONTINES[0];
  const weeks = Array.from({ length: tontine.total_weeks }, (_, i) => i + 1);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/tontines")} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{tontine.name}</h2>
            <StatusBadge status={tontine.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{tontine.type} · {tontine.duration}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: fr ? "Cotisation" : "Contribution", value: formatXAF(tontine.contribution), icon: Coins, color: "#4CAF68" },
          { label: fr ? "Membres" : "Members", value: `${tontine.enrolled}/${tontine.capacity}`, icon: Users, color: "#6E3A9A" },
          { label: fr ? "Semaine actuelle" : "Current week", value: `${tontine.current_week}/${tontine.total_weeks}`, icon: Calendar, color: "#F2994A" },
          { label: fr ? "Pot du tour" : "Round pool", value: formatXAF(tontine.pool_amount), icon: Trophy, color: "#4CAF68" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="font-bold text-sm" style={{ fontFamily: "Geist Mono, monospace" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress timeline */}
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
          <span className="text-[#F2994A] font-medium">{fr ? "Semaine" : "Week"} {tontine.current_week} {fr ? "(actuelle)" : "(current)"}</span>
          <span>{fr ? "Fin dans" : "Ends in"} {tontine.total_weeks - tontine.current_week} {fr ? "semaines" : "weeks"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        {[
          { key: "grid", label: fr ? "Grille contributions" : "Contribution grid" },
          { key: "members", label: fr ? "Participants" : "Participants" },
          { key: "rounds", label: fr ? "Historique des tours" : "Round history" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === CONTRIBUTION GRID (flagship) === */}
      {activeTab === "grid" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Grille de suivi des contributions" : "Contribution tracking grid"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{fr ? "Chaque cellule représente une contribution hebdomadaire." : "Each cell represents a weekly contribution."}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[#4CAF68]" />
                <span className="text-muted-foreground">{fr ? "Payé" : "Paid"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[#E5484D]/20 border border-[#E5484D]/30" />
                <span className="text-muted-foreground">{fr ? "Non payé" : "Unpaid"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={14} color="#F2994A" />
                <span className="text-muted-foreground">{fr ? "Paiement reçu" : "Payout received"}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            {/* Week headers */}
            <div className="flex gap-1.5 mb-2 ml-44">
              {weeks.map((w) => (
                <div
                  key={w}
                  className={`w-10 text-center text-xs font-medium flex-shrink-0 ${
                    w === tontine.current_week ? "text-[#F2994A]" : "text-muted-foreground"
                  }`}
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  S{w}
                </div>
              ))}
            </div>

            {/* Member rows */}
            <div className="space-y-1.5">
              {tontine.members.map((member) => (
                <div key={member.id} className="flex items-center gap-1.5">
                  {/* Member info */}
                  <div className="w-44 flex items-center gap-2.5 flex-shrink-0 pr-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: member.payout_received ? "#F2994A" : "#6E3A9A" }}>
                        {member.avatar}
                      </div>
                      {member.payout_received && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F2994A] flex items-center justify-center">
                          <Trophy size={8} color="white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">#{member.position}</p>
                    </div>
                  </div>

                  {/* Contribution cells */}
                  {member.contributions.map((paid, wi) => {
                    const isCurrent = wi + 1 === tontine.current_week;
                    const isFuture = wi + 1 > tontine.current_week;
                    return (
                      <div
                        key={wi}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs flex-shrink-0 transition-all
                          ${isFuture
                            ? "bg-muted/40 text-muted-foreground/30"
                            : paid
                              ? "bg-[#4CAF68] text-white shadow-sm"
                              : "bg-[#E5484D]/12 border border-[#E5484D]/25 text-[#E5484D]"
                          }
                          ${isCurrent && !isFuture ? "ring-2 ring-[#F2994A]/50" : ""}
                        `}
                        title={paid ? (fr ? "Payé" : "Paid") : (isFuture ? (fr ? "À venir" : "Upcoming") : (fr ? "Non payé" : "Unpaid"))}
                      >
                        {isFuture ? (
                          <span className="text-xs">·</span>
                        ) : paid ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={13} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Info row */}
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
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
              <div className="col-span-1">#</div>
              <div className="col-span-5">{fr ? "Membre" : "Member"}</div>
              <div className="col-span-3 text-center">{fr ? "Contributions" : "Contributions"}</div>
              <div className="col-span-3 text-center">{fr ? "Statut" : "Status"}</div>
            </div>
            {tontine.members.map((member) => {
              const paidCount = member.contributions.filter(Boolean).length;
              const totalDue = tontine.current_week;
              return (
                <div key={member.id} className="grid grid-cols-12 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20">
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{member.position}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "#6E3A9A" }}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.payout_received && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Trophy size={11} color="#F2994A" />
                          <span className="text-xs text-[#F2994A]">{fr ? "Tour reçu" : "Payout received"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className={`text-sm font-bold ${paidCount === totalDue ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                      {paidCount}/{totalDue}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    {paidCount === totalDue ? (
                      <StatusBadge status="Paid" size="sm" />
                    ) : (
                      <StatusBadge status="Unpaid" size="sm" />
                    )}
                  </div>
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
            {tontine.members.map((member, i) => {
              const weekNum = i + 1;
              const done = weekNum < tontine.current_week;
              const current = weekNum === tontine.current_week;
              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-[#4CAF68] text-white" : current ? "bg-[#F2994A] text-white" : "bg-muted text-muted-foreground"}`}>
                    {done ? <Trophy size={14} /> : weekNum}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fr ? "Semaine" : "Week"} {weekNum} · {done ? (fr ? "Payement distribué" : "Payout distributed") : current ? (fr ? "Tour actuel" : "Current round") : (fr ? "À venir" : "Upcoming")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace", color: done ? "#1F9D55" : current ? "#F2994A" : "var(--muted-foreground)" }}>
                      {done || current ? formatXAF(tontine.pool_amount) : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
