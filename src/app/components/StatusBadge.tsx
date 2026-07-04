import { CheckCircle, Clock, XCircle, AlertCircle, ShieldCheck, Ban } from "lucide-react";

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

const CONFIG: Record<Status, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  Approved: { label: "Approuvé", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Active: { label: "Actif", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Paid: { label: "Payé", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Completed: { label: "Terminé", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: ShieldCheck },
  Open: { label: "Ouvert", bg: "bg-[#F0E8FF] dark:bg-[#2A1B3D]", text: "text-[#6E3A9A] dark:text-[#9B6FCA]", Icon: CheckCircle },
  Published: { label: "Publié", bg: "bg-[#E8F5EC] dark:bg-[#1A3326]", text: "text-[#1F9D55] dark:text-[#4CAF68]", Icon: CheckCircle },
  Pending: { label: "En attente", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", Icon: Clock },
  Scheduled: { label: "Planifié", bg: "bg-[#F0E8FF] dark:bg-[#2A1B3D]", text: "text-[#6E3A9A] dark:text-[#9B6FCA]", Icon: Clock },
  "Almost Full": { label: "Presque complet", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", Icon: AlertCircle },
  Draft: { label: "Brouillon", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Clock },
  Archived: { label: "Archivé", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Ban },
  Rejected: { label: "Rejeté", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: XCircle },
  Suspended: { label: "Suspendu", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: Ban },
  Unpaid: { label: "Non payé", bg: "bg-red-50 dark:bg-red-950/40", text: "text-[#E5484D] dark:text-red-400", Icon: XCircle },
  Closed: { label: "Fermé", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Ban },
  High: { label: "Prioritaire", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", Icon: AlertCircle },
  Normal: { label: "Normal", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", Icon: Clock },
};

const STATUS_ALIASES: Record<string, Status> = {
  not_submitted: "Pending",
  approved: "Approved", pending: "Pending", rejected: "Rejected",
  active: "Active", suspended: "Suspended", deactivated: "Suspended",
  paid: "Paid", unpaid: "Unpaid", completed: "Completed",
  open: "Open", closed: "Closed", published: "Published", draft: "Draft", archived: "Archived", scheduled: "Scheduled",
};

function resolveStatus(status: string): Status {
  if (status in CONFIG) return status as Status;
  const normalized = STATUS_ALIASES[status.toLowerCase()];
  return normalized ?? "Normal";
}

export function StatusBadge({ status, showIcon = true, size = "sm" }: StatusBadgeProps) {
  const cfg = CONFIG[resolveStatus(status)];
  const { label, bg, text, Icon } = cfg;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-sm gap-1.5";
  const iconSize = size === "sm" ? 11 : 13;

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${sizeClass}`}>
      {showIcon && <Icon size={iconSize} />}
      {label}
    </span>
  );
}
