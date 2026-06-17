import { CheckCircle, Clock, XCircle, AlertCircle, ShieldCheck, Ban } from "lucide-react";

type Status =
  | "Approved" | "Active" | "Paid" | "Completed" | "Open"
  | "Pending" | "Almost Full"
  | "Rejected" | "Suspended" | "Unpaid" | "Closed"
  | "High" | "Normal";

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const CONFIG: Record<Status, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  Approved: { label: "Approuvé", bg: "bg-[#E8F5EC]", text: "text-[#1F9D55]", Icon: CheckCircle },
  Active: { label: "Actif", bg: "bg-[#E8F5EC]", text: "text-[#1F9D55]", Icon: CheckCircle },
  Paid: { label: "Payé", bg: "bg-[#E8F5EC]", text: "text-[#1F9D55]", Icon: CheckCircle },
  Completed: { label: "Terminé", bg: "bg-[#E8F5EC]", text: "text-[#1F9D55]", Icon: ShieldCheck },
  Open: { label: "Ouvert", bg: "bg-[#F0E8FF]", text: "text-[#6E3A9A]", Icon: CheckCircle },
  Pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-600", Icon: Clock },
  "Almost Full": { label: "Presque complet", bg: "bg-orange-50", text: "text-orange-600", Icon: AlertCircle },
  Rejected: { label: "Rejeté", bg: "bg-red-50", text: "text-[#E5484D]", Icon: XCircle },
  Suspended: { label: "Suspendu", bg: "bg-red-50", text: "text-[#E5484D]", Icon: Ban },
  Unpaid: { label: "Non payé", bg: "bg-red-50", text: "text-[#E5484D]", Icon: XCircle },
  Closed: { label: "Fermé", bg: "bg-gray-100", text: "text-gray-500", Icon: Ban },
  High: { label: "Prioritaire", bg: "bg-orange-50", text: "text-orange-600", Icon: AlertCircle },
  Normal: { label: "Normal", bg: "bg-gray-100", text: "text-gray-500", Icon: Clock },
};

export function StatusBadge({ status, showIcon = true, size = "sm" }: StatusBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.Normal;
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
