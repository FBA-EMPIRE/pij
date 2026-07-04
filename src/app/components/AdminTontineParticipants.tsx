import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Trophy, Award, Coins } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { fetchTontineById, fetchTontineMembers } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";
import { formatXAF } from "../lib/format";

export default function AdminTontineParticipants() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [contribMemberId, setContribMemberId] = useState("");
  const [contribRound, setContribRound] = useState("1");
  const [contribAmount, setContribAmount] = useState("");
  const [recordingContrib, setRecordingContrib] = useState(false);
  const [contribError, setContribError] = useState("");
  const [contribSuccess, setContribSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchTontineById(id),
      fetchTontineMembers(id),
    ]).then(([tontineData, memberData]) => {
      setTontine(tontineData);
      setMembers(memberData.map((m: any) => ({
        ...m,
        name: m.users?.full_name || m.users?.email || "User",
      })));
      setLoading(false);
    });
  }, [id]);

  if (loading) return null;
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

  const unassignedMembers = members.filter((m: any) => !m.has_received_payout);
  const contribution = tontine.tontine_types?.contribution_amount ?? 0;

  const handleAssignPayout = async () => {
    if (!selectedMemberId) return;
    const member = members.find((m: any) => m.user_id === selectedMemberId);
    if (!member) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data: lastRound } = await supabase
      .from("tontine_rounds")
      .select("round_number")
      .eq("tontine_id", tontine.id)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextRoundNumber = (lastRound?.round_number ?? 0) + 1;

    const { data: round, error: roundErr } = await supabase
      .from("tontine_rounds")
      .insert({
        tontine_id: tontine.id,
        round_number: nextRoundNumber,
        recipient_member_id: member.id,
        status: "paid",
        payout_date: new Date().toISOString().slice(0, 10),
        recorded_by: currentUser?.id ?? null,
      })
      .select()
      .single();
    if (roundErr) return;

    await supabase.from("tontine_members").update({
      has_received_payout: true,
    }).eq("id", member.id);

    await supabase.from("audit_logs").insert({
      actor_id: currentUser?.id ?? null,
      action: "Round Payout Recorded",
      entity_type: "tontine_round",
      entity_id: round.id,
      metadata: { tontine_id: tontine.id, round_number: nextRoundNumber, recipient_member_id: member.id },
    });

    setMembers(members.map((m: any) =>
      m.user_id === selectedMemberId ? { ...m, has_received_payout: true } : m
    ));
    setSelectedMemberId(null);
  };

  const handleRecordContribution = async () => {
    setContribError("");
    setContribSuccess("");
    const member = members.find((m: any) => m.user_id === contribMemberId);
    const round = Number(contribRound);
    const amount = Number(contribAmount);
    if (!member) {
      setContribError(fr ? "Veuillez sélectionner un membre." : "Please select a member.");
      return;
    }
    if (!Number.isInteger(round) || round <= 0) {
      setContribError(fr ? "Le numéro de tour doit être un entier positif." : "Round must be a positive integer.");
      return;
    }
    if (!amount || amount <= 0) {
      setContribError(fr ? "Le montant doit être positif." : "Amount must be positive.");
      return;
    }

    setRecordingContrib(true);
    const { data: result, error: err } = await supabase.functions.invoke("tontine-record-contribution", {
      body: { tontine_id: tontine.id, member_id: member.id, amount, round },
    });
    setRecordingContrib(false);

    if (err || !result?.success) {
      setContribError(result?.error || err?.message || (fr ? "Erreur lors de l'enregistrement." : "Error recording contribution."));
      return;
    }

    setContribSuccess(fr ? "Cotisation enregistrée." : "Contribution recorded.");
    setContribMemberId("");
    setContribAmount("");
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
          <p className="text-sm text-muted-foreground">{fr ? "Gestion des participants" : "Participant management"}</p>
        </div>
      </div>

      {/* Contribution recording */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Coins size={16} className="text-[#4CAF68]" />
          {fr ? "Enregistrer une cotisation" : "Record a contribution"}
        </h3>
        {contribError && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{contribError}</div>
        )}
        {contribSuccess && (
          <div className="mb-3 p-3 rounded-xl bg-[#E8F5EC] border border-[#4CAF68]/30 text-[#1F9D55] text-sm">{contribSuccess}</div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={contribMemberId}
            onChange={(e) => setContribMemberId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
          >
            <option value="">{fr ? "Sélectionner un membre" : "Select a member"}</option>
            {members.map((m: any) => (
              <option key={m.user_id} value={m.user_id}>{m.name}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={contribRound}
            onChange={(e) => setContribRound(e.target.value)}
            placeholder={fr ? "Tour n°" : "Round #"}
            className="w-28 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
          />
          <input
            type="number"
            min={1}
            value={contribAmount}
            onChange={(e) => setContribAmount(e.target.value)}
            placeholder={contribution ? formatXAF(contribution) : (fr ? "Montant" : "Amount")}
            className="w-40 px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
          />
          <button
            onClick={handleRecordContribution}
            disabled={!contribMemberId || recordingContrib}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "#4CAF68" }}
          >
            {recordingContrib ? (fr ? "Enregistrement..." : "Recording...") : (fr ? "Enregistrer" : "Record")}
          </button>
        </div>
      </div>

      {/* Payout Assignment */}
      {unassignedMembers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award size={16} className="text-[#F2994A]" />
            {fr ? "Attribuer le paiement" : "Assign payout"}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedMemberId ?? ""}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            >
              <option value="">{fr ? "Sélectionner un membre" : "Select a member"}</option>
              {unassignedMembers.map((m: any) => (
                <option key={m.user_id} value={m.user_id}>#{m.payout_order} {m.name}</option>
              ))}
            </select>
            <button
              onClick={handleAssignPayout}
              disabled={!selectedMemberId}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "#F2994A" }}
            >
              <Trophy size={14} className="inline mr-1" />
              {fr ? "Marquer comme bénéficiaire" : "Mark as recipient"}
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            {fr ? "Participants" : "Participants"} ({members.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">{fr ? "Membre" : "Member"}</th>
                <th className="px-5 py-3 text-center">{fr ? "Paiement reçu" : "Payout received"}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-sm text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{m.payout_order}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.has_received_payout ? (
                      <Trophy size={16} className="inline text-[#F2994A]" />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
