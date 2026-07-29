import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Users, Calendar, Coins, Info, Send, Clock, UserPlus } from "lucide-react";
import { formatXAF } from "../lib/format";
import { fetchTontineById, fetchTontineMembers, fetchTontineRounds, getCurrentUserId, applyToTontine } from "../lib/supabase/queries";
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
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getCurrentUserId().then(setCurrentUserId);
    Promise.all([
      fetchTontineById(id),
      fetchTontineMembers(id),
      fetchTontineRounds(id),
    ]).then(([t, m, r]) => {
      setTontine(t);
      setMembers(m);
      setRounds(r);
    }).finally(() => setLoading(false));
  }, [id]);

  const activeMembers = members.filter((m) => m.status === "active");
  const mappedMembers = activeMembers.map(m => {
    const name = m.users?.full_name ?? m.users?.email ?? "User";
    return {
      id: m.id,
      name,
      avatar: name.charAt(0).toUpperCase(),
      position: m.position,
      payout_received: m.payout_received ?? false,
    };
  });

  const enrolledCount = activeMembers.length;
  const myMembership = currentUserId ? members.find((m) => m.user_id === currentUserId) : undefined;
  const isActiveMember = myMembership?.status === "active";
  const isPendingApplicant = myMembership?.status === "pending";
  const showJoinButton = tontine?.status === "open" && !myMembership && !requestSent;
  const fillPct = tontine?.capacity > 0 ? Math.round((enrolledCount / tontine.capacity) * 100) : 0;

  const handleRequestJoin = async () => {
    if (!currentUserId || !id) return;
    setJoinError("");
    try {
      await applyToTontine({ user_id: currentUserId, tontine_id: id });
      setRequestSent(true);
    } catch (err: any) {
      setJoinError(err?.message || (fr ? "Erreur lors de la demande." : "Error sending request."));
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
          <p className="text-sm text-muted-foreground mt-0.5">{tontine.tontine_types?.name ?? tontine.frequency ?? ""}</p>
        </div>
      </div>

      {/* General Information */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Informations générales" : "General Information"}</h3>
        <p className="text-sm text-muted-foreground mb-4">{tontine.tontine_types?.name ?? ""}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
            <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.tontine_types?.contribution_amount ?? 0)}</p>
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
        </div>
      </div>

      {/* Statistics + Join Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Places disponibles" : "Available slots"}</p>
          <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>
            {tontine.capacity - enrolledCount} <span className="text-sm font-normal text-muted-foreground">/ {tontine.capacity}</span>
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="h-2 rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "#F2994A" : "#4CAF68" }} />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Participants inscrits" : "Participants joined"}</p>
          <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{enrolledCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Gain attendu" : "Expected payout"}</p>
          <p className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF((tontine.tontine_types?.contribution_amount ?? 0) * tontine.capacity)}</p>
        </div>
      </div>

      {requestSent && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
          <Send size={16} color="#4CAF68" />
          <p className="text-sm text-[#1F9D55]">{fr ? "Demande envoyée avec succès !" : "Request sent successfully!"}</p>
        </div>
      )}

      {/* Pending approval notice */}
      {isPendingApplicant && !requestSent && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
          <Clock size={16} className="text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {fr
              ? "Votre demande est en attente d'approbation par un administrateur. Vous pourrez suivre l'évolution de la tontine une fois approuvé(e)."
              : "Your request is pending admin approval. You'll be able to follow the tontine's evolution once approved."}
          </p>
        </div>
      )}

      {/* Join Button */}
      {showJoinButton && (
        <>
          {joinError && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{joinError}</div>
          )}
          <button onClick={handleRequestJoin} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all mb-6" style={{ background: "#4CAF68" }}>
            <UserPlus size={18} /> {fr ? "Demander à rejoindre" : "Request To Join"}
          </button>
        </>
      )}

      {/* Participant Preview (for non-active-members viewing an Open tontine) */}
      {mappedMembers.length > 0 && !isActiveMember && (
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

      {/* Tabs - only for approved (active) members */}
      {isActiveMember && (
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

          {/* === GRID === */}
          {activeTab === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mappedMembers.map((member) => (
                <div key={member.id} className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-2">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>#{member.position}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "#6E3A9A" }}>
                    {member.avatar}
                  </div>
                  <span className="text-sm font-medium truncate w-full">{member.name}</span>
                  <StatusBadge status={member.payout_received ? "Paid" : "Active"} size="sm" />
                </div>
              ))}
            </div>
          )}

          {/* === HISTORY / ROUNDS === */}
          {activeTab === "rounds" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Historique des tours" : "Round history"}</h3>
              </div>
              {rounds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucun tour enregistré" : "No rounds recorded yet"}</p>
              ) : (
                <div className="divide-y divide-border">
                  {rounds.map((round) => {
                    const recipient = mappedMembers.find((m) => m.id === round.recipient_member_id);
                    return (
                      <div key={round.id} className="flex items-center gap-3 px-5 py-4">
                        <span className="text-sm font-medium text-muted-foreground w-16" style={{ fontFamily: "Geist Mono, monospace" }}>
                          #{round.round_number}
                        </span>
                        <span className="flex-1 text-sm font-medium truncate">{recipient?.name ?? (fr ? "Non attribué" : "Unassigned")}</span>
                        <span className="text-xs text-muted-foreground">{round.payout_date ?? "—"}</span>
                        <StatusBadge status={round.status === "paid" ? "Paid" : "Pending"} size="sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* === PARTICIPANTS === */}
          {activeTab === "members" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Liste des participants" : "Participant list"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{enrolledCount} {fr ? "membres inscrits" : "enrolled members"}</p>
              </div>
              <div>
                <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">{fr ? "Membre" : "Member"}</div>
                  <div className="col-span-3 text-center">{fr ? "Statut" : "Status"}</div>
                  <div className="col-span-3 text-center">{fr ? "Paiement" : "Payout"}</div>
                </div>
                {mappedMembers.map((member) => (
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
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-3 flex flex-col sm:block text-right sm:text-center">
                      <span className={`text-xs sm:text-sm font-bold`} style={{ fontFamily: "Geist Mono, monospace" }}>
                        {member.payout_received ? (fr ? "Reçu" : "Received") : "—"}
                      </span>
                    </div>
                    <div className="hidden sm:flex col-span-3 justify-center">
                      {member.payout_received ? (
                        <StatusBadge status="Paid" size="sm" />
                      ) : (
                        <StatusBadge status="Pending" size="sm" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
