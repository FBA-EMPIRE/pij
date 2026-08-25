import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import { consultationsApi, type Consultation, type ConsultationStatus } from "../../lib/api/formations";
import { Modal } from "./Modal";

export interface ConsultationResponseProps {
  consultationId: string;
  // There's no consultations-get endpoint -- only consultations-list --
  // so this fetches the request's own details (message/user/current
  // status) by listing this formation's consultations and picking out
  // consultationId, rather than requiring the caller to pass the full
  // Consultation object down.
  formationId: string;
  onSuccess: (consultation: Consultation) => void;
  onCancel: () => void;
}

// "responded"/"resolved"/"closed" mapped onto the real status values
// consultations-respond actually accepts (approved/completed/cancelled) --
// see ConsultationCard.tsx for why.
const STATUS_OPTIONS: { value: ConsultationStatus; labelFr: string; labelEn: string }[] = [
  { value: "approved", labelFr: "Répondu", labelEn: "Responded" },
  { value: "completed", labelFr: "Résolu", labelEn: "Resolved" },
  { value: "cancelled", labelFr: "Fermé", labelEn: "Closed" },
];

export default function ConsultationResponse({ consultationId, formationId, onSuccess, onCancel }: ConsultationResponseProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState<ConsultationStatus>("approved");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await consultationsApi.list({ formation_id: formationId, limit: 100 });
        if (!res.success || !res.data) throw new Error(res.error || "Failed to load consultation");
        const found = res.data.consultations.find((c) => c.id === consultationId) ?? null;
        if (!found) throw new Error(fr ? "Demande introuvable" : "Request not found");
        if (cancelled) return;
        setConsultation(found);
        setResponseText(found.admin_notes ?? "");
        setStatus(found.status === "pending" ? "approved" : "completed");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || (fr ? "Échec du chargement" : "Failed to load"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [consultationId, formationId, fr]);

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      setError(fr ? "Veuillez saisir une réponse." : "Please enter a response.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await consultationsApi.respond(consultationId, responseText, status);
      if (!res.success || !res.data) throw new Error(res.error || "Failed to respond");
      toast.success(fr ? "Réponse envoyée" : "Response sent");
      onSuccess(res.data.consultation);
    } catch (err: any) {
      const message = err?.message || (fr ? "Échec de l'envoi" : "Failed to respond");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const profile = consultation?.users?.profiles;
  const memberName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : consultation?.users?.email;

  return (
    <Modal title={fr ? "Répondre à la demande" : "Respond to request"} onClose={onCancel} maxWidth="max-w-lg">
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">{fr ? "Chargement..." : "Loading..."}</p>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          {consultation && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
              <p className="font-medium text-foreground">{memberName || consultation.users?.email}</p>
              {memberName && <p className="text-[11px]">{consultation.users?.email}</p>}
              <p className="mt-1.5">{consultation.need}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">{fr ? "Réponse" : "Response"}</label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
              placeholder={fr ? "Votre réponse..." : "Your response..."}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Statut" : "Status"}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{fr ? opt.labelFr : opt.labelEn}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
              {fr ? "Annuler" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#4CAF68" }}
            >
              {saving ? (fr ? "Envoi..." : "Sending...") : (fr ? "Envoyer" : "Send")}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
