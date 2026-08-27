import { useState } from "react";
import { X, Loader2, FileText, Check, XCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { trainerService, type PendingFormateurRequest } from "../../lib/api/trainers";
import type { FormateurRequestDocument } from "../../types";

interface TrainerRequestDetailModalProps {
  request: PendingFormateurRequest;
  onClose: () => void;
  onDone: () => void;
}

export default function TrainerRequestDetailModal({ request, onClose, onDone }: TrainerRequestDetailModalProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [openingDocId, setOpeningDocId] = useState<string | null>(null);

  const applicantName = request.applicant_name
    || [request.users?.profiles?.first_name, request.users?.profiles?.last_name].filter(Boolean).join(" ")
    || request.users?.email || "—";

  const handleViewDocument = async (doc: FormateurRequestDocument) => {
    setOpeningDocId(doc.id);
    setError("");
    try {
      const url = await trainerService.getDocumentUrl(doc.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err?.message || (fr ? "Impossible d'ouvrir le document." : "Could not open the document."));
    } finally {
      setOpeningDocId(null);
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    setSubmitting(action);
    setError("");
    const result = action === "approve"
      ? await trainerService.approveRequest(request.id, reason.trim() || undefined)
      : await trainerService.rejectRequest(request.id, reason.trim() || undefined);
    setSubmitting(null);
    if (!result.success) {
      setError(result.error || (fr ? "Une erreur est survenue." : "An error occurred."));
      return;
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
            {fr ? "Candidature Formateur" : "Trainer Application"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Nom" : "Name"}</p>
              <p className="font-medium">{applicantName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "E-mail" : "Email"}</p>
              <p className="font-medium truncate">{request.applicant_email || request.users?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Catégorie" : "Category"}</p>
              <p className="font-medium">{request.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{fr ? "Soumise le" : "Submitted"}</p>
              <p className="font-medium">{request.created_at.split("T")[0]}</p>
            </div>
          </div>

          {request.message && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{fr ? "Message" : "Message"}</p>
              <p className="text-sm p-3 rounded-xl bg-muted/30">{request.message}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-1.5">{fr ? "Documents justificatifs" : "Supporting documents"}</p>
            <div className="space-y-1.5">
              {request.formateur_request_documents?.length ? request.formateur_request_documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleViewDocument(doc)}
                  disabled={openingDocId === doc.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm text-left hover:bg-muted transition-all disabled:opacity-50"
                >
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{doc.file_name}</span>
                  {doc.file_size && <span className="text-xs text-muted-foreground shrink-0">{doc.file_size}</span>}
                  {openingDocId === doc.id && <Loader2 size={14} className="animate-spin shrink-0" />}
                </button>
              )) : <p className="text-sm text-muted-foreground">{fr ? "Aucun document." : "No documents."}</p>}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <label className="text-sm font-medium">{fr ? "Note (optionnel)" : "Note (optional)"}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder={fr ? "Raison de la décision..." : "Reason for the decision..."}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview("reject")}
                disabled={submitting !== null}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: "#E5484D" }}
              >
                {submitting === "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {fr ? "Refuser" : "Reject"}
              </button>
              <button
                onClick={() => handleReview("approve")}
                disabled={submitting !== null}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: "#4CAF68" }}
              >
                {submitting === "approve" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {fr ? "Approuver" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
