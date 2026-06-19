import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, CheckCircle, XCircle, TrendingUp, Send, Clock, UserCheck, Archive, Eye } from "lucide-react";
import { TONTINES, JOIN_REQUESTS, MEMBERS, ARCHIVES, AUDIT_LOGS, ROUND_RECIPIENTS, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function AdminTontineDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [justPublished, setJustPublished] = useState(false);

  const tontine = TONTINES.find((t) => t.id === id);
  if (!tontine) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
        </button>
        <p className="text-muted-foreground">{fr ? "Tontine introuvable" : "Tontine not found"}</p>
      </div>
    );
  }

  const pct = tontine.current_week > 0 ? Math.round((tontine.current_week / tontine.total_weeks) * 100) : 0;
  const pendingRequests = JOIN_REQUESTS.filter((r) => r.tontineId === tontine.id && (r.status === "Pending" || r.status === "Pending Entry Fee"));
  const tontineAuditLogs = AUDIT_LOGS.filter((log) => log.entity.includes(tontine.id) || log.entity.includes(tontine.name));

  const handlePublish = () => {
    tontine.status = "Open";
    setJustPublished(true);
    AUDIT_LOGS.push({
      id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
      actor: "Admin Kone",
      action: "Tontine Published",
      entity: `Tontine ${tontine.id}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: "192.168.1.45",
    });
  };

  const handleValidateEntryFee = (requestId: string) => {
    const req = JOIN_REQUESTS.find((r) => r.id === requestId);
    if (!req) return;
    req.status = "Approved";
    const memberData = MEMBERS.find((m) => m.id === req.userId);
    if (memberData) {
      const newMember = {
        id: tontine.members.length + 1,
        name: memberData.name,
        avatar: memberData.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
        position: tontine.enrolled + 1,
        payout_received: false,
        contributions: new Array(tontine.total_weeks).fill(false),
      };
      tontine.members.push(newMember);
      tontine.enrolled += 1;
      tontine.pool_amount = tontine.contribution * tontine.enrolled;
      if (tontine.status === "Open" && tontine.enrolled >= 2) {
        tontine.status = "In Progress";
        tontine.current_week = 1;
      }
    }
    AUDIT_LOGS.push({
      id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
      actor: "Admin Kone",
      action: "Entry Fee Validated",
      entity: `Member ${req.userId} → ${tontine.id}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: "192.168.1.45",
    });
  };

  const handleArchive = () => {
    const archiveEntry = {
      id: `ARC-${String(ARCHIVES.length + 1).padStart(3, "0")}`,
      originalId: tontine.id,
      name: tontine.name,
      description: tontine.description,
      contribution: tontine.contribution,
      entry_fee: tontine.entry_fee,
      capacity: tontine.capacity,
      total_weeks: tontine.total_weeks,
      start_date: tontine.start_date,
      end_date: new Date().toISOString().split("T")[0],
      frequency: tontine.frequency,
      total_collected: tontine.members.reduce((sum, m) => sum + m.contributions.filter(Boolean).length * tontine.contribution, 0),
      members: [...tontine.members],
      recipients: ROUND_RECIPIENTS.filter((r) => r.tontineId === tontine.id),
    };
    ARCHIVES.push(archiveEntry);
    tontine.status = "Archived";
    AUDIT_LOGS.push({
      id: `LOG-${String(AUDIT_LOGS.length + 1).padStart(3, "0")}`,
      actor: "Admin Kone",
      action: "Tontine Archived",
      entity: `Tontine ${tontine.id} → ${archiveEntry.id}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: "192.168.1.45",
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{tontine.name}</h2>
            <StatusBadge status={tontine.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{tontine.type} · {tontine.duration} · {fr ? "Début" : "Start"}: {tontine.start_date}</p>
          {tontine.description && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{tontine.description}</p>}
        </div>
        <div className="flex gap-2">
          {(tontine.status === "In Progress" || tontine.status === "Open") && (
            <button onClick={() => navigate(`/admin/tontines/${tontine.id}/participants`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Users size={13} /> {fr ? "Participants" : "Participants"}
            </button>
          )}
          {tontine.status === "Draft" && (
            <button onClick={handlePublish} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "#4CAF68" }}>
              <Send size={13} /> {fr ? "Publier" : "Publish"}
            </button>
          )}
          {(tontine.status === "Completed") && (
            <button onClick={handleArchive} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Archive size={13} /> {fr ? "Archiver" : "Archive"}
            </button>
          )}
        </div>
      </div>

      {justPublished && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
          <CheckCircle size={16} color="#4CAF68" />
          <p className="text-sm text-[#1F9D55]">{fr ? "Tontine publiée avec succès !" : "Tontine published successfully!"}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.contribution)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Membres" : "Members"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{tontine.enrolled}/{tontine.capacity}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Frais d'entrée" : "Entry fee"}</p>
          <p className="text-lg font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.entry_fee)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{fr ? "Pot par tour" : "Pool/round"}</p>
          <p className="text-lg font-bold mt-1 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(tontine.pool_amount)}</p>
        </div>
      </div>

      {/* Progress */}
      {tontine.current_week > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{fr ? "Progression" : "Progress"}</span>
            <span className="font-medium text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>
              {fr ? "Tour" : "Round"} {tontine.current_week}/{tontine.total_weeks}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="h-2.5 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Join Requests Queue */}
      {pendingRequests.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            {fr ? "Demandes en attente" : "Pending requests"} ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const member = MEMBERS.find((m) => m.id === req.userId);
              return (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {member ? member.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member?.name || req.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.status === "Pending Entry Fee" ? (fr ? "Frais d'entrée en attente de validation" : "Entry fee pending validation") : (fr ? "En attente de validation" : "Pending validation")}
                    </p>
                  </div>
                  {req.status === "Pending Entry Fee" && (
                    <button onClick={() => handleValidateEntryFee(req.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "#4CAF68" }}>
                      <UserCheck size={13} /> {fr ? "Valider" : "Validate"}
                    </button>
                  )}
                  {req.status === "Pending" && (
                    <span className="text-xs text-[#F2994A] font-medium">{fr ? "En attente" : "Pending"}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-card rounded-2xl border border-border mb-6">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            {fr ? "Participants" : "Participants"} ({tontine.members.length})
          </h3>
          {tontine.members.length > 0 && (
            <button onClick={() => navigate(`/admin/tontines/${tontine.id}/participants`)} className="text-xs text-[#4CAF68] font-medium hover:underline flex items-center gap-1">
              <Eye size={12} /> {fr ? "Gérer" : "Manage"}
            </button>
          )}
        </div>
        {tontine.members.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">{fr ? "Aucun participant" : "No participants"}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <th className="px-5 py-3 text-left">{fr ? "Position" : "Position"}</th>
                  <th className="px-5 py-3 text-left">{fr ? "Membre" : "Member"}</th>
                  <th className="px-5 py-3 text-center">{fr ? "Paiement reçu" : "Payout"}</th>
                  <th className="px-5 py-3 text-center">{fr ? "Contributions" : "Contribs"}</th>
                </tr>
              </thead>
              <tbody>
                {tontine.members.map((m) => {
                  const paidCount = m.contributions.filter(Boolean).length;
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>#{m.position}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {m.avatar}
                          </div>
                          <span className="text-sm font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {m.payout_received ? (
                          <span className="text-[#F2994A] text-xs font-medium flex items-center justify-center gap-1">
                            🏆 {fr ? "Tour reçu" : "Round Received"}
                          </span>
                        ) : (
                          <XCircle size={16} className="inline text-[#CBD5E1]" />
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {m.contributions.map((paid, i) => (
                            <div
                              key={i}
                              className={`w-5 h-5 rounded flex items-center justify-center ${paid ? "bg-[#E8F5EC] text-[#4CAF68]" : "bg-red-50 text-[#E5484D]"}`}
                              title={`${fr ? "Semaine" : "Week"} ${i + 1}: ${paid ? fr ? "Payé" : "Paid" : fr ? "Impayé" : "Unpaid"}`}
                            >
                              {paid ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-1">{paidCount}/{m.contributions.length}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout rounds */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          {fr ? "Tours de paiement" : "Payout rounds"}
        </h3>
        {tontine.members.filter((m) => m.payout_received).length === 0 ? (
          <p className="text-sm text-muted-foreground">{fr ? "Aucun paiement effectué" : "No payouts made yet"}</p>
        ) : (
          <div className="space-y-2">
            {tontine.members.filter((m) => m.payout_received).map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/20">
                <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fr ? "Tour" : "Round"} #{m.position} · {formatXAF(tontine.pool_amount)}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#F2994A]">🏆 {fr ? "Tour reçu" : "Received"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit trail */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">{fr ? "Journal d'audit" : "Audit trail"}</h3>
        {tontineAuditLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{fr ? "Aucune entrée d'audit pour cette tontine" : "No audit entries for this tontine"}</p>
        ) : (
          <div className="space-y-2">
            {tontineAuditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.entity} · {log.actor}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
