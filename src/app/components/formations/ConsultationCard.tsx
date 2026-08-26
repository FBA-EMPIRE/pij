import { Calendar, Mail } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import type { Consultation, ConsultationStatus } from "../../lib/api/formations";

export interface ConsultationCardProps {
  consultation: Consultation;
  onRespond: () => void;
}

// The spec's pending/responded/resolved/closed vocabulary (with a blue
// "responded" state) doesn't exist in the schema -- consultation_requests
// .status is pending/approved/completed/cancelled, and none of the
// app's existing StatusBadge colors include blue. Mapped 1:1 onto the
// closest real state: approved reads as "responded" (someone answered
// but the request isn't finished yet), completed as "resolved",
// cancelled as "closed".
const STATUS_STYLES: Record<ConsultationStatus, { bg: string; text: string; labelFr: string; labelEn: string }> = {
  pending: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", labelFr: "En attente", labelEn: "Pending" },
  approved: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", labelFr: "Répondu", labelEn: "Responded" },
  completed: { bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", labelFr: "Résolu", labelEn: "Resolved" },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", labelFr: "Fermé", labelEn: "Closed" },
};

export default function ConsultationCard({ consultation, onRespond }: ConsultationCardProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const profile = consultation.users?.profiles;
  const memberName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : (consultation.users?.email ?? "—");
  const style = STATUS_STYLES[consultation.status] ?? STATUS_STYLES.pending;

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold">{memberName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
              {fr ? style.labelFr : style.labelEn}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={11} /> {consultation.users?.email}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar size={11} /> {consultation.created_at?.slice(0, 10)}</p>
          {consultation.course && (
            <p className="text-xs text-[#6E3A9A] mt-1">
              {fr ? "Concernant" : "Regarding"}: {fr ? consultation.course.title : (consultation.course.title_en || consultation.course.title)}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">{consultation.need}</p>
          {consultation.admin_notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">{fr ? "Réponse" : "Response"}: {consultation.admin_notes}</p>
          )}
        </div>
        <button onClick={onRespond} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium shrink-0" style={{ background: "#4CAF68" }}>
          {fr ? "Répondre" : "Respond"}
        </button>
      </div>
    </div>
  );
}
