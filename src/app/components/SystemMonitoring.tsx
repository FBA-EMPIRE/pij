import { useState } from "react";
import {
  Download, UserPlus, Activity, AlertTriangle, Shield,
  Clock, Edit, XCircle, RefreshCw, Landmark, UserMinus,
  ChevronRight
} from "lucide-react";
import { ADMINS } from "./mockData";
import { useAppContext } from "../context/AppContext";

const roleDisplay = (role: string, fr: boolean) => {
  if (role === "super_admin") return fr ? "Super Admin" : "Super Admin";
  return fr ? "Administrateur" : "Admin";
};

const AUDIT_LOGS = [
  {
    icon: Shield,
    iconColor: "#E5484D",
    iconBg: "#FEE2E2",
    title: "Master Password Reset Initiated",
    titleFr: "Réinitialisation du mot de passe maître",
    desc: "Admin Super_Root triggered a system-wide security credential rotation.",
    descFr: "L'admin Super_Root a déclenché une rotation des identifiants de sécurité.",
    id: "8xf2-93kd-pl90",
    time: "12:45 PM",
  },
  {
    icon: Landmark,
    iconColor: "#6E3A9A",
    iconBg: "#F0E8FF",
    title: "Liquidity Threshold Adjusted",
    titleFr: "Seuil de liquidité ajusté",
    desc: "Admin Jean-Paul Diallo increased reserve threshold to 15%.",
    descFr: "L'admin Jean-Paul Diallo a augmenté le seuil de réserve à 15%.",
    id: "",
    time: "10:12 AM",
  },
  {
    icon: UserMinus,
    iconColor: "#E8A317",
    iconBg: "#FEF3C7",
    title: "Member Access Revoked",
    titleFr: "Accès membre révoqué",
    desc: "Security Policy automatically disabled 3 inactive accounts.",
    descFr: "La politique de sécurité a automatiquement désactivé 3 comptes inactifs.",
    id: "",
    time: "Yesterday",
    timeFr: "Hier",
  },
];

export default function SystemMonitoring() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoKYC, setAutoKYC] = useState(true);
  const [withdrawalLimit, setWithdrawalLimit] = useState("500,000");

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Surveillance Système" : "System Monitoring"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fr ? "Vue d'ensemble de la santé de la plateforme et des opérations administratives." : "Overall platform health and administrative overview."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
            <Download size={16} />
            {fr ? "Exporter Audit" : "Export Audit"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
            <UserPlus size={16} />
            {fr ? "Nouvel Admin" : "New Admin"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Liquidity */}
        <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-muted-foreground/20">
            <Landmark size={40} />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {fr ? "Liquidité Totale Plateforme" : "Total Platform Liquidity"}
          </p>
          <p className="text-3xl font-bold mb-1" style={{ fontFamily: "Geist Mono, monospace" }}>
            284.5M <span className="text-lg font-normal text-muted-foreground">XAF</span>
          </p>
          <p className="text-xs font-medium" style={{ color: "#4CAF68" }}>
            📈 +12.4% {fr ? "depuis le mois dernier" : "from last month"}
          </p>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {fr ? "Santé du Système" : "System Health"}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E8F5EC" }}>
              <Activity size={20} color="#4CAF68" />
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>99.9%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {fr ? "Tous les microservices opérationnels" : "All microservices operational"}
          </p>
        </div>

        {/* Critical Alerts */}
        <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ background: "#FEE2E2", borderColor: "#FECACA" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#991B1B" }}>
            {fr ? "Alertes Critiques" : "Critical Alerts"}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={24} color="#E5484D" />
            <span className="text-3xl font-bold" style={{ fontFamily: "Geist Mono, monospace", color: "#991B1B" }}>02</span>
          </div>
          <p className="text-xs" style={{ color: "#991B1B" }}>
            {fr ? "Nécessite une attention immédiate" : "Requires immediate attention"}
          </p>
        </div>
      </div>

      {/* Admin Management Table */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Gestion des Administrateurs" : "Admin Management"}
          </h2>
          <span className="px-3 py-1 rounded-full border border-border text-xs font-medium text-muted-foreground">
            8 Total Admins
          </span>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
          <span>{fr ? "ADMINISTRATEUR" : "ADMINISTRATOR"}</span>
          <span>{fr ? "RÔLE" : "ROLE"}</span>
          <span>{fr ? "DERNIÈRE ACTIVITÉ" : "LAST ACTIVITY"}</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {ADMINS.map((admin) => (
            <div key={admin.email} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-4 items-center">
              {/* Admin Info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: admin.initialsColor }}
                >
                  {admin.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </div>

              {/* Role */}
              <div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${admin.role === "super_admin" ? "bg-[#F0E8FF] text-[#6E3A9A]" : "bg-[#E8F5EC] text-[#1F9D55]"}`}
                >
                  {roleDisplay(admin.role, fr)}
                </span>
              </div>

              {/* Last Activity */}
              <div className="text-sm text-muted-foreground">
                {fr ? admin.lastLoginFr : admin.lastLogin}
              </div>

              {/* Status */}
              <div>
                <span className="flex items-center gap-1.5 text-sm">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: admin.status === "Active" ? "#4CAF68" : "#E8A317" }}
                  />
                  {admin.status === "Active" ? (fr ? "Actif" : "Active") : (fr ? "Suspendu" : "Suspended")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 text-xs font-medium">
                <button className="text-[#4CAF68] hover:underline">{fr ? "Modifier" : "Edit"}</button>
                {admin.status === "Active" ? (
                  <button className="text-[#E5484D] hover:underline">{fr ? "Révoquer" : "Revoke"}</button>
                ) : (
                  <button className="text-[#4CAF68] hover:underline">{fr ? "Restaurer" : "Restore"}</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center pt-4">
          <button className="text-sm text-[#4CAF68] font-medium hover:underline">
            {fr ? "Voir tous les administrateurs (8)" : "View all administrators (8)"}
          </button>
        </div>
      </div>

      {/* Bottom Row: Audit Log + Global Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* System Audit Log */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F0E8FF" }}>
              <Shield size={16} color="#6E3A9A" />
            </div>
            <h3 className="text-base font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {fr ? "Journal d'Audit Système" : "System Audit Log"}
            </h3>
          </div>

          <div className="space-y-4">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: log.iconBg }}
                >
                  <log.icon size={16} color={log.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{fr ? log.titleFr : log.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{fr && log.timeFr ? log.timeFr : log.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {fr ? log.descFr : log.desc}
                  </p>
                  {log.id && (
                    <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
                      🔗 ID: {log.id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-5">
            <button className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
              {fr ? "Voir l'historique immuable complet" : "View Full Immutable History"}
            </button>
          </div>
        </div>

        {/* Global Control */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Contrôle Global" : "Global Control"}
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            {fr ? "Paramètres critiques de la plateforme" : "Critical platform state overrides"}
          </p>

          <div className="space-y-5">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{fr ? "Mode Maintenance" : "Maintenance Mode"}</p>
                <p className="text-xs text-muted-foreground">
                  {fr ? "Désactiver toutes les transactions" : "Disable all user transactions"}
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-[#4CAF68]" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* Auto-KYC */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{fr ? "Vérification Auto-KYC" : "Auto-KYC Verification"}</p>
                <p className="text-xs text-muted-foreground">
                  {fr ? "Approbation instantanée par IA" : "AI-powered instant approval"}
                </p>
              </div>
              <button
                onClick={() => setAutoKYC(!autoKYC)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoKYC ? "bg-[#4CAF68]" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoKYC ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* Withdrawal Limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{fr ? "Limite de Retrait" : "Withdrawal Limit"}</p>
                  <p className="text-xs text-muted-foreground">
                    {fr ? "Max par transaction (XAF)" : "Max per transaction (XAF)"}
                  </p>
                </div>
              </div>
              <input
                value={withdrawalLimit}
                onChange={(e) => setWithdrawalLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
              />
            </div>
          </div>

          <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}>
            <RefreshCw size={16} />
            {fr ? "Appliquer les changements" : "Apply Config Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
