import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Trophy, CheckCircle, Users, Calendar, Archive } from "lucide-react";
import { ARCHIVES, CURRENT_USER_ID, formatXAF } from "./mockData";
import { useAppContext } from "../context/AppContext";

export default function TontineArchiveDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const archive = ARCHIVES.find((a) => a.id === id);
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

  const myEntry = archive.members.find((m) => m.name.includes("Amara"));
  const freqLabel = archive.frequency === "weekly" ? (fr ? "Hebdomadaire" : "Weekly") : archive.frequency === "biweekly" ? (fr ? "Bihebdomadaire" : "Biweekly") : (fr ? "Mensuel" : "Monthly");

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour à mes tontines" : "Back to my tontines"}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#6E3A9A]/10 flex items-center justify-center">
          <Archive size={20} color="#6E3A9A" />
        </div>
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{archive.name}</h2>
          <p className="text-sm text-muted-foreground">{freqLabel} · {archive.total_weeks} {fr ? "semaines" : "weeks"} · {archive.start_date} → {archive.end_date}</p>
        </div>
      </div>

      {archive.description && (
        <p className="text-sm text-muted-foreground mb-6">{archive.description}</p>
      )}

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
              <p className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{myEntry.contributions.filter(Boolean).length}/{myEntry.contributions.length}</p>
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
              <p className="text-xs text-muted-foreground">{fr ? "Montant total" : "Total amount"}</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(archive.total_collected)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Participants" : "Participants"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{archive.members.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(archive.contribution)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(archive.entry_fee)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Total collecté" : "Total collected"}</p>
          <p className="text-lg font-bold mt-1 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(archive.total_collected)}</p>
        </div>
      </div>

      {/* Recipients timeline */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-[#F2994A]" />
          {fr ? "Historique des paiements" : "Payout history"}
        </h3>
        <div className="space-y-2">
          {archive.recipients.map((r) => {
            const member = archive.members.find((m) => m.id === r.memberId);
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
                <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">
                  {member?.avatar || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member?.name || `Member #${r.memberId}`}</p>
                  <p className="text-xs text-muted-foreground">{fr ? "Tour" : "Round"} {r.round} · {r.assignedAt}</p>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(r.amount)}</span>
                <Trophy size={14} color="#F2994A" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Full participant list */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          {fr ? "Tous les participants" : "All participants"}
        </h3>
        <div className="space-y-2">
          {archive.members.map((m) => {
            const paidCount = m.contributions.filter(Boolean).length;
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <span className="text-sm text-muted-foreground w-8" style={{ fontFamily: "Geist Mono, monospace" }}>#{m.position}</span>
                <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
                <span className="text-sm font-medium flex-1">{m.name}</span>
                <span className="text-xs text-muted-foreground">{paidCount}/{m.contributions.length} {fr ? "payées" : "paid"}</span>
                {m.payout_received && <Trophy size={14} color="#F2994A" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
