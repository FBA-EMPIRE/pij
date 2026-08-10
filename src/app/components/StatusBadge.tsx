import { CheckCircle, Clock, XCircle, AlertCircle, ShieldCheck, Ban } from "lucide-react";
import { useAppContext } from "../context/AppContext";

type Status =
  | "Approved" | "Active" | "Paid" | "Completed" | "Open"
  | "Pending" | "Almost Full"
  | "Rejected" | "Suspended" | "Unpaid" | "Closed"
  | "High" | "Normal" | "Published" | "Draft" | "Archived" | "Scheduled";

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const CONFIG: Record<Status, { label: string; labelEn: string; bg: string; text: string; Icon: React.ElementType }> = {
  Approved: { label: "Approuvé", labelEn: "Approved", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Active: { label: "Actif", labelEn: "Active", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Paid: { label: "Payé", labelEn: "Paid", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Completed: { label: "Terminé", labelEn: "Completed", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: ShieldCheck },
  Open: { label: "Ouvert", labelEn: "Open", bg: "bg-[#F0E8FF] dark:bg-[#2A1B3D]", text: "text-[#6E3A9A] dark:text-[#9B6FCA]", Icon: CheckCircle },
  Published: { label: "Publié", labelEn: "Published", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Pending: { label: "En attente", labelEn: "Pending", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", Icon: Clock },
  Scheduled: { label: "Planifié", labelEn: "Scheduled", bg: "bg-[#F0E8FF] dark:bg-[#2A1B3D]", text: "text-[#6E3A9A] dark:text-[#9B6FCA]", Icon: Clock },
  "Almost Full": { label: "Presque complet", labelEn: "Almost full", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", Icon: AlertCircle },
  Draft: { label: "Brouillon", labelEn: "Draft", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Clock },
  Archived: { label: "Archivé", labelEn: "Archived", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Ban },
  Rejected: { label: "Rejeté", labelEn: "Rejected", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: XCircle },
  Suspended: { label: "Suspendu", labelEn: "Suspended", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: Ban },
  Unpaid: { label: "Non payé", labelEn: "Unpaid", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: XCircle },
  Closed: { label: "Fermé", labelEn: "Closed", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Ban },
  High: { label: "Prioritaire", labelEn: "High priority", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", Icon: AlertCircle },
  Normal: { label: "Normal", labelEn: "Normal", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Clock },
};

const STATUS_ALIASES: Record<string, Status> = {
  not_submitted: "Pending",
  approved: "Approved", pending: "Pending", rejected: "Rejected", cancelled: "Rejected",
  active: "Active", suspended: "Suspended", deactivated: "Suspended", removed: "Rejected",
  paid: "Paid", unpaid: "Unpaid", completed: "Completed",
  open: "Open", closed: "Closed", published: "Published", draft: "Draft", archived: "Archived", scheduled: "Scheduled",
  "en attente": "Pending", "approuvé": "Approved", "actif": "Active", "rejeté": "Rejected",
  "suspendu": "Suspended", "payé": "Paid", "non payé": "Unpaid", "terminé": "Completed",
  "ouvert": "Open", "fermé": "Closed", "publié": "Published", "brouillon": "Draft", "archivé": "Archived", "planifié": "Scheduled",
};

function resolveStatus(status: string): Status {
  if (status in CONFIG) return status as Status;
  const normalized = STATUS_ALIASES[status.toLowerCase()];
  return normalized ?? "Normal";
}

export function StatusBadge({ status, showIcon = true, size = "sm" }: StatusBadgeProps) {
  const { lang } = useAppContext();
  const cfg = CONFIG[resolveStatus(status)];
  const { label, labelEn, bg, text, Icon } = cfg;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-sm gap-1.5";
  const iconSize = size === "sm" ? 11 : 13;

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${sizeClass}`}>
      {showIcon && <Icon size={iconSize} />}
      {lang === "fr" ? label : labelEn}
    </span>
  );
}
