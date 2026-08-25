import { X } from "lucide-react";

// Shared modal chrome for the Formation module's add/edit dialogs --
// matches the confirm-dialog pattern already used elsewhere in the app
// (see components/modals/ConfirmAssignFormateur.tsx).
export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className={`bg-card rounded-2xl border border-border w-full ${maxWidth} shadow-2xl my-8`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
