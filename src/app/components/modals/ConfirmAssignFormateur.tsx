import { useState } from "react";
import { X, GraduationCap, Loader2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { trainerService } from "../../lib/api/trainers";

interface ConfirmAssignFormateurProps {
  userId: string;
  userName: string;
  currentRoleLabel: string;
  action: "assign" | "revoke";
  onClose: () => void;
  onDone: () => void;
}

export default function ConfirmAssignFormateur({ userId, userName, currentRoleLabel, action, onClose, onDone }: ConfirmAssignFormateurProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAssign = action === "assign";

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    const result = isAssign ? await trainerService.assign(userId) : await trainerService.revoke(userId);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || (fr ? "Une erreur est survenue." : "An error occurred."));
      return;
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base flex items-center gap-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
            <GraduationCap size={18} color="#4CAF68" />
            {isAssign
              ? (fr ? "Assigner comme Formateur" : "Assign as Trainer")
              : (fr ? "Révoquer le rôle Formateur" : "Revoke Trainer role")}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm">
            {isAssign
              ? (fr
                  ? <>Êtes-vous sûr de vouloir assigner <strong>{userName}</strong> comme Formateur ?</>
                  : <>Are you sure you want to assign <strong>{userName}</strong> as Trainer?</>)
              : (fr
                  ? <>Êtes-vous sûr de vouloir révoquer le rôle Formateur de <strong>{userName}</strong> ?</>
                  : <>Are you sure you want to revoke the Trainer role from <strong>{userName}</strong>?</>)}
          </p>
          <p className="text-xs text-muted-foreground">
            {fr ? "Rôle actuel : " : "Current role: "}<span className="font-medium text-foreground">{currentRoleLabel}</span>
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ background: isAssign ? "#4CAF68" : "#E5484D" }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isAssign ? (fr ? "Oui, assigner" : "Yes, assign") : (fr ? "Oui, révoquer" : "Yes, revoke")}
          </button>
        </div>
      </div>
    </div>
  );
}
