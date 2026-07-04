import { useEffect, useState } from "react";
import { CheckCircle, XCircle, MessageSquare, Eye, FileText, Camera, Clock, ArrowLeft, Download, AlertTriangle, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { fetchKycQueue, kycApprove, kycReject, requestKycMoreInfo, getKycDocumentUrl, type KycQueueEntry, type KycQueueDocument } from "../lib/supabase/queries";

const DOC_LABELS: Record<string, { fr: string; en: string; icon: React.ElementType }> = {
  id_front: { fr: "Recto de la pièce d'identité", en: "ID document — front", icon: FileText },
  id_back: { fr: "Verso de la pièce d'identité", en: "ID document — back", icon: FileText },
  selfie: { fr: "Selfie de vérification", en: "Verification selfie", icon: Camera },
};

function docLabel(type: string, fr: boolean) {
  const cfg = DOC_LABELS[type];
  if (cfg) return fr ? cfg.fr : cfg.en;
  return type;
}

function DocumentPreview({ doc, fr }: { doc: KycQueueDocument; fr: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isPdf = doc.storage_path.toLowerCase().endsWith(".pdf");
  const fileName = doc.storage_path.split("/").pop() ?? doc.storage_path;

  useEffect(() => {
    setLoading(true);
    setError("");
    getKycDocumentUrl(doc.storage_path)
      .then(setUrl)
      .catch((err) => setError(err?.message || (fr ? "Impossible de charger le document." : "Could not load document.")))
      .finally(() => setLoading(false));
  }, [doc.storage_path]);

  const Icon = DOC_LABELS[doc.document_type]?.icon ?? FileText;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-muted/20">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon size={16} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{docLabel(doc.document_type, fr)}</p>
          <p className="text-xs text-muted-foreground truncate">
            {fileName} · {new Date(doc.submitted_at).toLocaleDateString(fr ? "fr-FR" : "en-US")}
          </p>
        </div>
        {url && (
          <a href={url} download target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0" title={fr ? "Télécharger" : "Download"}>
            <Download size={15} className="text-muted-foreground" />
          </a>
        )}
      </div>
      <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center">
        {loading ? (
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        ) : error ? (
          <p className="text-xs text-red-500 px-4 text-center">{error}</p>
        ) : isPdf ? (
          <iframe src={url ?? undefined} className="w-full h-full" title={fileName} />
        ) : (
          <img src={url ?? undefined} alt={docLabel(doc.document_type, fr)} className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
}

export default function KYCReview() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [queue, setQueue] = useState<KycQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KycQueueEntry | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | "info" | null>(null);
  const [note, setNote] = useState("");
  const [showInfoPrompt, setShowInfoPrompt] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadQueue = () => {
    setLoading(true);
    return fetchKycQueue().then(setQueue).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (entry: KycQueueEntry) => {
    setActionError("");
    setProcessing(true);
    try {
      await kycApprove({ user_id: entry.user_id, note });
      setQueue((prev) => prev.filter((q) => q.user_id !== entry.user_id));
      setSelected(entry);
      setDecision("approved");
    } catch (err: any) {
      setActionError(err?.message || (fr ? "Erreur lors de l'approbation." : "Error approving application."));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (entry: KycQueueEntry) => {
    setActionError("");
    setProcessing(true);
    try {
      await kycReject({ user_id: entry.user_id, note });
      setQueue((prev) => prev.filter((q) => q.user_id !== entry.user_id));
      setSelected(entry);
      setDecision("rejected");
    } catch (err: any) {
      setActionError(err?.message || (fr ? "Erreur lors du rejet." : "Error rejecting application."));
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestInfo = async (entry: KycQueueEntry) => {
    if (!infoMessage.trim()) return;
    setActionError("");
    setProcessing(true);
    try {
      await requestKycMoreInfo({ user_id: entry.user_id, message: infoMessage.trim() });
      setSelected(entry);
      setDecision("info");
      setShowInfoPrompt(false);
      setInfoMessage("");
    } catch (err: any) {
      setActionError(err?.message || (fr ? "Erreur lors de l'envoi." : "Error sending request."));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (selected && !decision) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => { setSelected(null); setNote(""); setShowInfoPrompt(false); setActionError(""); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft size={14} /> {fr ? "Retour à la file" : "Back to queue"}
        </button>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{actionError}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Documents */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Documents soumis" : "Submitted documents"}</h3>
              {selected.documents.length === 0 ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {fr ? "Aucun document n'a été soumis par ce membre." : "No documents have been submitted by this member."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.documents.map((doc) => (
                    <DocumentPreview key={doc.id} doc={doc} fr={fr} />
                  ))}
                </div>
              )}
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
                  { label: fr ? "ID de membre" : "Member ID", value: selected.uid },
                  { label: fr ? "Date de soumission" : "Submission date", value: new Date(selected.submitted_at).toLocaleString(fr ? "fr-FR" : "en-US") },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-medium">{row.value || "—"}</span>
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
                  onClick={() => handleApprove(selected)}
                  disabled={processing}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#4CAF68] text-[#4CAF68] hover:bg-[#E8F5EC] disabled:opacity-50 transition-all text-xs font-medium"
                >
                  <CheckCircle size={18} />
                  {fr ? "Approuver" : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(selected)}
                  disabled={processing}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#E5484D] text-[#E5484D] hover:bg-red-50 disabled:opacity-50 transition-all text-xs font-medium"
                >
                  <XCircle size={18} />
                  {fr ? "Rejeter" : "Reject"}
                </button>
                <button
                  onClick={() => setShowInfoPrompt(true)}
                  disabled={processing}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#6E3A9A] text-[#6E3A9A] hover:bg-[#F0E8FF] disabled:opacity-50 transition-all text-xs font-medium"
                >
                  <MessageSquare size={18} />
                  {fr ? "Info. manq." : "More info"}
                </button>
              </div>

              {showInfoPrompt && (
                <div className="mt-4 p-4 rounded-xl border border-[#6E3A9A]/30 bg-[#F0E8FF]/40 space-y-3">
                  <label className="text-sm font-medium">{fr ? "Quelle information manque-t-il ?" : "What information is missing?"}</label>
                  <textarea
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#6E3A9A]/40 resize-none"
                    placeholder={fr ? "Ex : la photo du recto est floue..." : "E.g.: the front-side photo is blurry..."}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowInfoPrompt(false)} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
                      {fr ? "Annuler" : "Cancel"}
                    </button>
                    <button
                      onClick={() => handleRequestInfo(selected)}
                      disabled={!infoMessage.trim() || processing}
                      className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-all"
                      style={{ background: "#6E3A9A" }}
                    >
                      {fr ? "Envoyer" : "Send"}
                    </button>
                  </div>
                </div>
              )}
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
            onClick={() => { setDecision(null); setSelected(null); setNote(""); loadQueue(); }}
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
        <p className="text-sm text-muted-foreground mt-1">{queue.length} {fr ? "dossiers en attente" : "applications pending"}</p>
      </div>

      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{actionError}</div>
      )}

      {queue.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <CheckCircle size={28} className="mx-auto mb-3 text-[#4CAF68]" />
          <p className="text-sm text-muted-foreground">{fr ? "Aucun dossier en attente" : "No applications pending"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((entry) => (
            <div
              key={entry.user_id}
              className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-[#4CAF68]/40 cursor-pointer transition-all"
              onClick={() => setSelected(entry)}
            >
              <div className="w-12 h-12 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white font-bold shrink-0">
                {entry.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{entry.name}</p>
                  <StatusBadge status="Pending" size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{entry.documents.length} {fr ? "document(s)" : "document(s)"} · {entry.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock size={11} />
                  {fr ? "Soumis le" : "Submitted"} {new Date(entry.submitted_at).toLocaleString(fr ? "fr-FR" : "en-US")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(entry); }}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-lg bg-[#E8F5EC] text-[#1F9D55] text-xs font-medium hover:bg-[#4CAF68] hover:text-white disabled:opacity-50 transition-all"
                >
                  {fr ? "Approuver" : "Approve"}
                </button>
                <button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(entry); }}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-[#E5484D] text-xs font-medium hover:bg-[#E5484D] hover:text-white disabled:opacity-50 transition-all"
                >
                  {fr ? "Rejeter" : "Reject"}
                </button>
                <button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelected(entry); }}
                  className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-accent hover:text-white transition-all"
                >
                  {fr ? "Réviser" : "Review"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
