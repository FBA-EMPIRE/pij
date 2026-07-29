import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Download, UserPlus, Activity, AlertTriangle, Shield,
  RefreshCw, Landmark,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { fetchAdmins, fetchDashboardStats, fetchSystemSettings, saveSystemSetting } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

interface AuditEntry {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  titleFr: string;
  desc: string;
  descFr: string;
  id: string;
  time: string;
  timeFr?: string;
}

export default function SystemMonitoring() {
  const { lang } = useAppContext();
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [withdrawalLimit, setWithdrawalLimit] = useState("500000");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [rawAuditLogs, setRawAuditLogs] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [platformLiquidity, setPlatformLiquidity] = useState(0);
  const [staleKycCount, setStaleKycCount] = useState(0);

  const handleApplySettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await Promise.all([
        saveSystemSetting("maintenance_mode", maintenanceMode),
        saveSystemSetting("withdrawal_limit", Number(withdrawalLimit) || 0),
      ]);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportAudit = () => {
    const rows = [["Actor", "Action", "Entity Type", "Entity ID", "Timestamp"]];
    rawAuditLogs.forEach((log) => rows.push([log.actor_id ?? "", log.action, log.entity_type ?? "", log.entity_id ?? "", log.created_at]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSystemSettings().then((settings) => {
      if (typeof settings.maintenance_mode === "boolean") setMaintenanceMode(settings.maintenance_mode);
      if (typeof settings.withdrawal_limit === "number") setWithdrawalLimit(String(settings.withdrawal_limit));
    });
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setRawAuditLogs(data);
          setAuditLogs(
            data.map((log: any) => ({
              icon: Shield,
              iconColor: "#6E3A9A",
              iconBg: "#F0E8FF",
              title: log.action,
              titleFr: log.action,
              desc: log.entity_id ? `${log.entity_type} / ${log.entity_id}` : log.entity_type,
              descFr: log.entity_id ? `${log.entity_type} / ${log.entity_id}` : log.entity_type,
              id: log.id,
              time: new Date(log.created_at).toLocaleString("fr-FR"),
            }))
          );
        }
      });
    fetchAdmins().then(setAdmins);
    fetchDashboardStats().then((stats) => setPlatformLiquidity(stats.total_savings + stats.total_current));

    const staleCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    supabase
      .from("kyc_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("submitted_at", staleCutoff)
      .then(({ count }) => setStaleKycCount(count ?? 0));
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
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
          <button onClick={handleExportAudit} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
            <Download size={16} />
            {fr ? "Exporter Audit" : "Export Audit"}
          </button>
          <button onClick={() => navigate("/admin/admins")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
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
            {formatXAF(platformLiquidity)}
          </p>
          <p className="text-xs text-muted-foreground">
            {fr ? "Comptes épargne + courants" : "Savings + current accounts"}
          </p>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {fr ? "Santé du Système" : "System Health"}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: staleKycCount === 0 ? "#E8F5EC" : "#FEF3C7" }}>
              <Activity size={20} color={staleKycCount === 0 ? "#4CAF68" : "#E8A317"} />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>
              {staleKycCount === 0 ? (fr ? "Opérationnel" : "Operational") : (fr ? "Attention requise" : "Attention needed")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {staleKycCount === 0
              ? (fr ? "Aucune révision KYC en retard" : "No overdue KYC reviews")
              : (fr ? `${staleKycCount} révision(s) KYC en retard` : `${staleKycCount} KYC review(s) overdue`)}
          </p>
        </div>

        {/* Critical Alerts */}
        <div className="rounded-2xl border p-6 relative overflow-hidden" style={staleKycCount > 0 ? { background: "#FEE2E2", borderColor: "#FECACA" } : {}}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: staleKycCount > 0 ? "#991B1B" : undefined }}>
            {fr ? "Alertes Critiques" : "Critical Alerts"}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={24} color={staleKycCount > 0 ? "#E5484D" : "#9CA3AF"} />
            <span className="text-3xl font-bold" style={{ fontFamily: "Geist Mono, monospace", color: staleKycCount > 0 ? "#991B1B" : undefined }}>
              {String(staleKycCount).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs" style={{ color: staleKycCount > 0 ? "#991B1B" : undefined }}>
            {fr ? "Dossiers KYC en attente depuis plus de 48h" : "KYC submissions pending over 48h"}
          </p>
        </div>
      </div>

      {/* Admin Management Summary */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {fr ? "Gestion des Administrateurs" : "Admin Management"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {admins.filter((a: any) => a.is_active).length} {fr ? "actifs" : "active"} · {admins.length} {fr ? "au total" : "total"}
            </p>
          </div>
          <button onClick={() => navigate("/admin/admins")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
            {fr ? "Gérer les administrateurs" : "Manage administrators"}
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {admins.slice(0, 8).map((admin: any) => (
            <div key={admin.email} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: admin.initialsColor }}>
                {admin.initials}
              </div>
              <span className="text-xs font-medium">{admin.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? "bg-[#4CAF68]" : "bg-[#E8A317]"}`} />
            </div>
          ))}
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
            {auditLogs.map((log, i) => (
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
            <button onClick={() => navigate("/admin/audit")} className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
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
                  {fr ? "Désactiver tous les dépôts et retraits" : "Disable all deposits and withdrawals"}
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-[#4CAF68]" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? "left-6" : "left-1"}`} />
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
                type="number"
                value={withdrawalLimit}
                onChange={(e) => setWithdrawalLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
              />
            </div>
          </div>

          {settingsSaved && (
            <p className="text-xs text-[#4CAF68] mt-3 text-center">{fr ? "Paramètres enregistrés" : "Settings saved"}</p>
          )}
          <button
            onClick={handleApplySettings}
            disabled={savingSettings}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}
          >
            <RefreshCw size={16} className={savingSettings ? "animate-spin" : ""} />
            {savingSettings ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Appliquer les changements" : "Apply Config Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
