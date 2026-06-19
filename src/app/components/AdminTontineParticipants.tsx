import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle, XCircle, Trophy, Users, Award } from "lucide-react";
import { TONTINES, CONTRIBUTION_LOGS, ROUND_RECIPIENTS, AUDIT_LOGS, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function AdminTontineParticipants() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [override, setOverride] = useState(false);

  const tontine = TONTINES.find((t) => t.id === id);
  if (!tontine) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour" : "Back"}
        </button>
        <p className="text-muted-foreground">{fr ? "Tontine introuvable" : "Tontine not found"}</p>
      </div>
    );
  }

  const weeks = Array.from({ length: tontine.total_weeks }, (_, i) => i + 1);
  const unassignedMembers = tontine.members.filter((m) => !m.payout_received);
  const allPaid = tontine.members.every((m) => m.contributions[tontine.current_week - 1] ?? false);
  const canCompleteRound = allPaid || override;

  const toggleContribution = (memberId: number, week: number) => {
    const member = tontine.members.find((m) => m.id === memberId);
    if (!member || week > tontine.current_week) return;
    const prev = member.contributions[week - 1];
    member.contributions[week - 1] = !prev;
    CONTRIBUTION_LOGS.push({
      id: `CLOG-${String(CONTRIBUTION_LOGS.length + 1).padStart(3, "0")}`,
      adminId: "Admin Kone",
      memberId,
      tontineId: tontine.id,
      round: week,
      previousStatus: prev,
      newStatus: !prev,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    });
    AUDIT_LOGS.push({
      id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
      actor: "Admin Kone",
      action: prev ? "Contribution Unmarked" : "Contribution Marked Paid",
      entity: `${tontine.id} / Member ${memberId} / Week ${week}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: "192.168.1.45",
    });
  };

  const handleAssignPayout = () => {
    if (!selectedMemberId) return;
    const member = tontine.members.find((m) => m.id === selectedMemberId);
    if (!member) return;
    member.payout_received = true;
    ROUND_RECIPIENTS.push({
      id: `RR-${String(ROUND_RECIPIENTS.length + 1).padStart(3, "0")}`,
      tontineId: tontine.id,
      round: tontine.current_week,
      memberId: member.id,
      amount: tontine.pool_amount,
      assignedAt: new Date().toISOString().split("T")[0],
    });
    AUDIT_LOGS.push({
      id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
      actor: "Admin Kone",
      action: "Round Payout Recorded",
      entity: `${tontine.id} / Round ${tontine.current_week} / ${member.name}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: "192.168.1.45",
    });
    tontine.current_week += 1;
    if (tontine.current_week > tontine.total_weeks) {
      tontine.status = "Completed";
      AUDIT_LOGS.push({
        id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
        actor: "Admin Kone",
        action: "Tontine Completed",
        entity: tontine.id,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        ip: "192.168.1.45",
      });
    }
    setSelectedMemberId(null);
    setOverride(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(`/admin/tontines/${tontine.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour aux détails" : "Back to details"}
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{tontine.name}</h2>
            <StatusBadge status={tontine.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{fr ? "Gestion des participants et contributions" : "Participant & contribution management"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{fr ? "Tour actuel" : "Current round"}</p>
          <p className="text-lg font-bold text-[#F2994A]" style={{ fontFamily: "Geist Mono, monospace" }}>
            {tontine.current_week > 0 ? `${tontine.current_week} / ${tontine.total_weeks}` : fr ? "Pas commencé" : "Not started"}
          </p>
        </div>
      </div>

      {/* Payout Assignment */}
      {tontine.current_week > 0 && tontine.current_week <= tontine.total_weeks && unassignedMembers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award size={16} className="text-[#F2994A]" />
            {fr ? "Attribuer le paiement du tour" : "Assign payout for current round"}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedMemberId ?? ""}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            >
              <option value="">{fr ? "Sélectionner un membre" : "Select a member"}</option>
              {unassignedMembers.map((m) => (
                <option key={m.id} value={m.id}>#{m.position} {m.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              {!allPaid && (
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="rounded border-border" />
                  {fr ? "Forcer le tour" : "Override round"}
                </label>
              )}
              <button
                onClick={handleAssignPayout}
                disabled={!selectedMemberId || !canCompleteRound}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: "#F2994A" }}
              >
                <Trophy size={14} className="inline mr-1" />
                {fr ? "Marquer comme bénéficiaire" : "Mark as recipient"}
              </button>
            </div>
          </div>
          {!allPaid && !override && (
            <p className="text-xs text-muted-foreground mt-2">
              {fr ? "Tous les membres doivent avoir payé leur cotisation, ou utiliser le forcement." : "All members must have paid their contribution, or use the override."}
            </p>
          )}
        </div>
      )}

      {/* Interactive Contribution Grid */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            {fr ? "Grille de contributions interactive" : "Interactive contribution grid"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{fr ? "Cliquez sur une cellule pour basculer entre payé/non payé" : "Click a cell to toggle paid/unpaid"}</p>
        </div>
        <div className="overflow-x-auto p-2 sm:p-4">
          <div className="flex gap-1 sm:gap-1.5 mb-3 ml-28 sm:ml-36">
            {weeks.map((w) => (
              <div
                key={w}
                className={`w-8 sm:w-12 text-center text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                  w === tontine.current_week ? "text-[#F2994A]" : w < tontine.current_week ? "text-muted-foreground" : "text-muted-foreground/40"
                }`}
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                {fr ? "Sem" : "Wk"} {w}
              </div>
            ))}
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            {tontine.members.map((member) => (
              <div key={member.id} className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-28 sm:w-36 flex items-center gap-2 flex-shrink-0 pr-1 sm:pr-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0 ${member.payout_received ? "bg-[#F2994A]" : "bg-[#6E3A9A]"}`}>
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">#{member.position}</p>
                  </div>
                </div>

                {member.contributions.map((paid, wi) => {
                  const weekNum = wi + 1;
                  const isPast = weekNum <= tontine.current_week;
                  const isCurrent = weekNum === tontine.current_week;
                  const isFuture = weekNum > tontine.current_week;
                  return (
                    <button
                      key={wi}
                      onClick={() => toggleContribution(member.id, weekNum)}
                      disabled={isFuture}
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 transition-all cursor-pointer
                        ${isFuture
                          ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                          : paid
                            ? "bg-[#4CAF68] text-white shadow-sm hover:bg-[#3d9a57]"
                            : "bg-[#E5484D]/12 border border-[#E5484D]/25 text-[#E5484D] hover:bg-[#E5484D]/20"
                        }
                        ${isCurrent && !isFuture ? "ring-1 sm:ring-2 ring-[#F2994A]/50" : ""}
                      `}
                      title={`${member.name} - ${fr ? "Semaine" : "Week"} ${weekNum}: ${paid ? fr ? "Payé" : "Paid" : isFuture ? fr ? "À venir" : "Upcoming" : fr ? "Non payé" : "Unpaid"}`}
                    >
                      {isFuture ? (
                        <span>·</span>
                      ) : paid ? (
                        <CheckCircle size={12} className="sm:w-[16px] sm:h-[16px]" />
                      ) : (
                        <XCircle size={12} className="sm:w-[15px] sm:h-[15px]" />
                      )}
                    </button>
                  );
                })}

                {/* Payout badge */}
                {member.payout_received && (
                  <div className="ml-1 sm:ml-2 shrink-0" title={fr ? "Tour reçu" : "Round Received"}>
                    <span className="text-xs">🏆</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#4CAF68]" />
          <span>{fr ? "Payé (cliquer pour défaire)" : "Paid (click to undo)"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#E5484D]/20 border border-[#E5484D]/30" />
          <span>{fr ? "Non payé (cliquer pour marquer)" : "Unpaid (click to mark)"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏆</span>
          <span>{fr ? "Tour reçu" : "Round Received"}</span>
        </div>
      </div>
    </div>
  );
}
