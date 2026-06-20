import { useNavigate } from "react-router";
import {
  Users, Wallet, TrendingUp, BarChart3, UserCog, Mail, Activity, FileSearch,
  ArrowUpRight, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  ADMIN_KPI, MEMBER_GROWTH_DATA, CONTRIBUTION_DATA, TONTINE_STATUS_DATA,
  ADMINS, AUDIT_LOGS, ADMIN_INVITATIONS, formatXAF
} from "./mockData";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const totalTontines = TONTINE_STATUS_DATA.reduce((sum, d) => sum + d.value, 0);
  const activeAdmins = ADMINS.filter(a => a.status === "Active").length;
  const totalAdmins = ADMINS.length;
  const pendingInvitations = ADMIN_INVITATIONS.filter(i => i.status === "Pending").length;
  const todayAudits = AUDIT_LOGS.filter(l =>
    new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const getAuditActionStyle = (action: string) => {
    if (action.includes("KYC")) return { bg: "#E8F0FE", color: "#1A73E8" };
    if (action.includes("Deposit") || action.includes("Contribution")) return { bg: "#E8F5EC", color: "#4CAF68" };
    if (action.includes("Tontine")) return { bg: "#E0F7FA", color: "#00897B" };
    if (action.includes("Role")) return { bg: "#FFF3E0", color: "#F2994A" };
    if (action.includes("Withdrawal")) return { bg: "#FDE8E8", color: "#E53E3E" };
    if (action.includes("Payout")) return { bg: "#F0E8FF", color: "#6E3A9A" };
    return { bg: "#F5F5F5", color: "#666" };
  };

  const roleBadge = (role: string) => {
    const isSuper = role === "super_admin";
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium text-[10px] px-1.5 py-0.5 ${isSuper ? "bg-[#F0E8FF] text-[#6E3A9A]" : "bg-[#E8F5EC] text-[#1F9D55]"}`}
      >
        {isSuper ? (fr ? "Super admin" : "Super Admin") : (fr ? "Admin" : "Admin")}
      </span>
    );
  };

  const kpiRow1 = [
    {
      label: fr ? "Membres totaux" : "Total Members",
      value: ADMIN_KPI.total_members.toLocaleString(),
      sub: `${ADMIN_KPI.active_members} ${fr ? "actifs" : "active"}`,
      icon: Users, color: "#4CAF68", bg: "#E8F5EC",
    },
    {
      label: fr ? "Administrateurs" : "Total Administrators",
      value: `${activeAdmins} ${fr ? "actifs" : "active"} / ${totalAdmins} ${fr ? "total" : "total"}`,
      sub: `${ADMINS.filter(a => a.role === "super_admin" && a.status === "Active").length} super admin · ${ADMINS.filter(a => a.role === "admin" && a.status === "Active").length} admin`,
      icon: UserCog, color: "#6E3A9A", bg: "#F0E8FF",
    },
    {
      label: fr ? "Tontines totales" : "Total Tontines",
      value: `${totalTontines} ${fr ? "total" : "total"}`,
      sub: `7 ${fr ? "actives" : "active"} · 3 ${fr ? "ouvertes" : "open"} · 12 ${fr ? "terminées" : "completed"}`,
      icon: TrendingUp, color: "#4CAF68", bg: "#E8F5EC",
    },
    {
      label: fr ? "Épargne totale" : "Total Savings",
      value: "284,5M XAF",
      sub: `+${ADMIN_KPI.monthly_growth}% ${fr ? "ce mois" : "this month"}`,
      icon: Wallet, color: "#4CAF68", bg: "#E8F5EC",
    },
  ];

  const kpiRow2 = [
    {
      label: fr ? "Investissements totaux" : "Total Investments",
      value: "156,8M XAF",
      sub: fr ? "Portefeuille global" : "Global portfolio",
      icon: BarChart3, color: "#6E3A9A", bg: "#F0E8FF",
    },
    {
      label: fr ? "Invitations en attente" : "Pending Invitations",
      value: `${pendingInvitations} ${fr ? "en attente" : "pending"}`,
      sub: fr ? "Nouvelle invitation en cours" : "New invitation pending",
      icon: Mail, color: "#F2994A", bg: "#FFF3E0", urgent: true,
    },
    {
      label: fr ? "Santé du système" : "System Health",
      value: `98% ${fr ? "Disponibilité" : "Uptime"}`,
      sub: fr ? "Opérationnel" : "Operational",
      icon: Activity, color: "#4CAF68", bg: "#E8F5EC",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Row 1 - 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiRow1.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold truncate" style={{ fontFamily: "Geist Mono, monospace" }}>{kpi.value}</p>
            <p className="text-xs mt-1 text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 2 - 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiRow2.map((kpi) => (
          <div key={kpi.label} className={`bg-card rounded-2xl border p-5 ${kpi.urgent ? "border-amber-200" : "border-border"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.urgent ? "text-amber-600" : "text-muted-foreground"}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Member growth */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Croissance des membres" : "Member growth"}</h3>
              <p className="text-xs text-muted-foreground">{fr ? "6 derniers mois" : "Last 6 months"}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-[#1F9D55]">
              <ArrowUpRight size={13} /> +{ADMIN_KPI.monthly_growth}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MEMBER_GROWTH_DATA}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF68" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CAF68" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="members" stroke="#4CAF68" strokeWidth={2} fill="url(#greenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contributions */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Contributions collectées" : "Contributions collected"}</h3>
              <p className="text-xs text-muted-foreground">XAF · {fr ? "6 derniers mois" : "Last 6 months"}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CONTRIBUTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000000).toFixed(1)}M XAF`]} />
              <Bar dataKey="amount" fill="#4CAF68" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tontine Status donut */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="mb-5" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Statut des Tontines" : "Tontine Status"}</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={TONTINE_STATUS_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {TONTINE_STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {TONTINE_STATUS_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Events */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSearch size={16} className="text-muted-foreground" />
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Événements d'audit" : "Audit Events"}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{AUDIT_LOGS.length}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{todayAudits} {fr ? "aujourd'hui" : "today"}</span>
          </div>
          <div className="space-y-1.5">
            {AUDIT_LOGS.slice(0, 4).map((log) => {
              const badge = getAuditActionStyle(log.action);
              return (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium">{log.actor}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{log.entity}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString(fr ? "fr-FR" : "en-US", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Administrators overview */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCog size={16} className="text-muted-foreground" />
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Administrateurs" : "Administrators"}</h3>
            </div>
            <button onClick={() => navigate("/admin/admins")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">
              {fr ? "Gérer" : "Manage"} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-1.5">
            {ADMINS.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/admins")}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: admin.initialsColor }}
                >
                  {admin.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{admin.name}</p>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${admin.status === "Active" ? "bg-[#4CAF68]" : "bg-red-400"}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{admin.email}</span>
                    {roleBadge(admin.role)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
