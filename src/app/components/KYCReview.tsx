import { useState } from "react";
import { CheckCircle, XCircle, MessageSquare, Eye, FileText, Camera, Clock, ArrowLeft } from "lucide-react";
import { KYC_QUEUE } from "./mockData";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function KYCReview() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [selected, setSelected] = useState<typeof KYC_QUEUE[0] | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | "info" | null>(null);
  const [note, setNote] = useState("");

  if (selected && !decision) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft size={14} /> {fr ? "Retour à la file" : "Back to queue"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Documents */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Documents soumis" : "Submitted documents"}</h3>
              <div className="space-y-3">
                {[
                  { label: fr ? "Recto de la pièce d'identité" : "ID document — front", icon: FileText },
                  { label: fr ? "Verso de la pièce d'identité" : "ID document — back", icon: FileText },
                  { label: fr ? "Selfie de vérification" : "Verification selfie", icon: Camera },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <doc.icon size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">{fr ? "Cliquer pour agrandir" : "Click to enlarge"}</p>
                    </div>
                    <Eye size={16} className="text-muted-foreground group-hover:text-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Document preview placeholder */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="aspect-[4/3] rounded-xl bg-muted/40 flex flex-col items-center justify-center gap-3">
                <FileText size={32} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{fr ? "Sélectionnez un document pour le prévisualiser" : "Select a document to preview"}</p>
              </div>
            </div>
          </div>

          {/* Right: Identity info & actions */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Informations d'identité" : "Identity information"}</h3>
              <div className="space-y-3">
                {[
                  { label: fr ? "Nom complet" : "Full name", value: selected.name },
                  { label: "Email", value: selected.email },
                  { label: fr ? "Téléphone" : "Phone", value: selected.phone },
                  { label: fr ? "Type de document" : "Document type", value: selected.id_type },
                  { label: fr ? "ID de membre" : "Member ID", value: selected.member_id },
                  { label: fr ? "Date de soumission" : "Submission date", value: new Date(selected.submitted).toLocaleString("fr-FR") },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision actions */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Décision" : "Decision"}</h3>
              <div>
                <label className="text-sm font-medium">{fr ? "Note (optionnel)" : "Note (optional)"}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none"
                  placeholder={fr ? "Motif du rejet, demande d'information complémentaire..." : "Rejection reason, request for additional information..."}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onClick={() => setDecision("approved")}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#4CAF68] text-[#4CAF68] hover:bg-[#E8F5EC] transition-all text-xs font-medium"
                >
                  <CheckCircle size={18} />
                  {fr ? "Approuver" : "Approve"}
                </button>
                <button
                  onClick={() => setDecision("rejected")}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#E5484D] text-[#E5484D] hover:bg-red-50 transition-all text-xs font-medium"
                >
                  <XCircle size={18} />
                  {fr ? "Rejeter" : "Reject"}
                </button>
                <button
                  onClick={() => setDecision("info")}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#6E3A9A] text-[#6E3A9A] hover:bg-[#F0E8FF] transition-all text-xs font-medium"
                >
                  <MessageSquare size={18} />
                  {fr ? "Info. manq." : "More info"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (decision) {
    const configs = {
      approved: { icon: CheckCircle, color: "#4CAF68", bg: "#E8F5EC", title: fr ? "Dossier KYC approuvé" : "KYC application approved", msg: fr ? "Le compte du membre a été activé avec succès." : "The member's account has been successfully activated." },
      rejected: { icon: XCircle, color: "#E5484D", bg: "#FEE2E2", title: fr ? "Dossier KYC rejeté" : "KYC application rejected", msg: fr ? "Le membre a été notifié avec les raisons du rejet." : "The member has been notified with the rejection reasons." },
      info: { icon: MessageSquare, color: "#6E3A9A", bg: "#F0E8FF", title: fr ? "Informations complémentaires demandées" : "Additional information requested", msg: fr ? "Le membre a été notifié et doit soumettre des documents complémentaires." : "The member has been notified and must submit additional documents." },
    };
    const cfg = configs[decision];
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: cfg.bg }}>
            <cfg.icon size={28} style={{ color: cfg.color }} />
          </div>
          <h3 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{cfg.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{cfg.msg}</p>
          <button
            onClick={() => { setDecision(null); setSelected(null); }}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90"
            style={{ background: "#4CAF68" }}
          >
            {fr ? "Traiter le prochain dossier" : "Process next application"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "File KYC" : "KYC Review Queue"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{KYC_QUEUE.length} {fr ? "dossiers en attente" : "applications pending"}</p>
      </div>

      <div className="space-y-3">
        {KYC_QUEUE.map((kyc) => (
          <div
            key={kyc.id}
            className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-[#4CAF68]/40 cursor-pointer transition-all"
            onClick={() => setSelected(kyc)}
          >
            <div className="w-12 h-12 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white font-bold shrink-0">
              {kyc.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{kyc.name}</p>
                <StatusBadge status={kyc.priority as any} size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">{kyc.id_type} · {kyc.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock size={11} />
                {fr ? "Soumis le" : "Submitted"} {new Date(kyc.submitted).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(kyc); setDecision("approved"); }}
                className="px-3 py-1.5 rounded-lg bg-[#E8F5EC] text-[#1F9D55] text-xs font-medium hover:bg-[#4CAF68] hover:text-white transition-all"
              >
                {fr ? "Approuver" : "Approve"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(kyc); setDecision("rejected"); }}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-[#E5484D] text-xs font-medium hover:bg-[#E5484D] hover:text-white transition-all"
              >
                {fr ? "Rejeter" : "Reject"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(kyc); }}
                className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-accent hover:text-white transition-all"
              >
                {fr ? "Réviser" : "Review"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
