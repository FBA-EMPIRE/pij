import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, Users, Calendar, Archive } from "lucide-react";
import { formatXAF } from "../lib/format";
import { fetchTontineById, fetchTontineMembers, fetchTontineContributionCounts, getCurrentUserId } from "../lib/supabase/queries";
import { useAppContext } from "../context/AppContext";

export default function TontineArchiveDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [archive, setArchive] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalRounds, setTotalRounds] = useState(0);
  const [paidByMember, setPaidByMember] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getCurrentUserId().then(setCurrentUserId);
    Promise.all([
      fetchTontineById(id),
      fetchTontineMembers(id),
      fetchTontineContributionCounts(id),
    ]).then(([t, m, c]) => {
      setArchive(t);
      setMembers(m);
      setTotalRounds(c.totalRounds);
      setPaidByMember(c.paidByMember);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-muted-foreground">{fr ? "Chargement..." : "Loading..."}</p>
      </div>
    );
  }

  if (!archive) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour" : "Back"}
        </button>
        <p className="text-muted-foreground">{fr ? "Archive introuvable" : "Archive not found"}</p>
      </div>
    );
  }

  const contributionAmount = archive.tontine_types?.contribution_amount ?? 0;
  const myEntry = members.find((m) => m.user_id === currentUserId);
  const mappedMembers = members.map(m => {
    const name = m.users?.full_name ?? m.users?.email ?? "User";
    return {
      id: m.id,
      name,
      avatar: name.charAt(0).toUpperCase(),
      position: m.position,
      paidRounds: paidByMember.get(m.id) ?? 0,
      payout_received: m.payout_received ?? false,
    };
  });
  const freqLabel = archive.tontine_types?.name ?? (
    archive.frequency === "daily" ? (fr ? "Journalier" : "Daily")
    : archive.frequency === "weekly" ? (fr ? "Hebdomadaire" : "Weekly")
    : archive.frequency === "biweekly" ? (fr ? "Bihebdomadaire" : "Biweekly")
    : archive.frequency === "quarterly" ? (fr ? "Trimestriel" : "Quarterly")
    : (fr ? "Mensuel" : "Monthly")
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour à mes tontines" : "Back to my tontines"}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#6E3A9A]/10 flex items-center justify-center">
          <Archive size={20} color="#6E3A9A" />
        </div>
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{archive.name}</h2>
          <p className="text-sm text-muted-foreground">{freqLabel} · {totalRounds} {fr ? "tours" : "rounds"} · {fr ? "Début" : "Start"} {archive.start_date}</p>
        </div>
      </div>

      {myEntry && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Ma participation" : "My participation"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Position" : "Position"}</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>#{myEntry.position}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Contributions" : "Contributions"}</p>
              <p className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{myEntry.paidRounds}/{totalRounds}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Paiement reçu" : "Payout received"}</p>
              <p className="text-lg font-bold">{myEntry.payout_received ? (
                <span className="text-[#F2994A]">🏆 {fr ? "Oui" : "Yes"}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Montant versé" : "Amount paid"}</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(myEntry.paidRounds * contributionAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Participants" : "Participants"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{mappedMembers.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(contributionAmount)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(archive.entry_fee)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Total collecté" : "Total collected"}</p>
          <p className="text-lg font-bold mt-1 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(mappedMembers.reduce((sum, m) => sum + m.paidRounds, 0) * contributionAmount)}</p>
        </div>
      </div>

      {/* Recipients timeline */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-[#F2994A]" />
          {fr ? "Historique des paiements" : "Payout history"}
        </h3>
        {mappedMembers.filter((m) => m.payout_received).length > 0 ? (
          <div className="space-y-2">
            {mappedMembers.filter((m) => m.payout_received).map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] border border-[#4CAF68]/20">
                <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">
                  {m.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{fr ? "Position" : "Position"} #{m.position}</p>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(contributionAmount * mappedMembers.length)}</span>
                <Trophy size={14} color="#F2994A" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{fr ? "Aucun historique de paiement disponible" : "No payout history available"}</p>
        )}
      </div>

      {/* Full participant list */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          {fr ? "Tous les participants" : "All participants"}
        </h3>
        <div className="space-y-2">
          {mappedMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              <span className="text-sm text-muted-foreground w-8" style={{ fontFamily: "Geist Mono, monospace" }}>#{m.position}</span>
              <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
              <span className="text-sm font-medium flex-1">{m.name}</span>
              <span className="text-xs text-muted-foreground">{m.paidRounds}/{totalRounds} {fr ? "payées" : "paid"}</span>
              {m.payout_received && <Trophy size={14} color="#F2994A" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
