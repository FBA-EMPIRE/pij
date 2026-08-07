import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users, Wallet, CreditCard, TrendingUp, BarChart3, UserCog, Mail, Activity, FileSearch,
  ChevronRight, Loader2, ArrowLeft
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  fetchDashboardStats, fetchUsers, fetchAdmins,
  fetchMemberGrowthTrend, fetchContributionTrend, fetchTontineStatusCounts,
} from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const [stats, setStats] = useState<{ memberCount: number; tontineCount: number; totalSavings: number; total_current?: number } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [memberGrowth, setMemberGrowth] = useState<{ month: string; members: number }[]>([]);
  const [contributionTrend, setContributionTrend] = useState<{ month: string; amount: number }[]>([]);
  const [tontineStatus, setTontineStatus] = useState({ open: 0, active: 0, closed: 0 });
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [auditToday, setAuditToday] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [s, u, a, mg, ct, ts, events, { count: todayCount }] = await Promise.all([
          fetchDashboardStats().catch(() => null),
          fetchUsers().catch(() => []),
          fetchAdmins().catch(() => []),
          fetchMemberGrowthTrend().catch(() => []),
          fetchContributionTrend().catch(() => []),
          fetchTontineStatusCounts().catch(() => ({ open: 0, active: 0, closed: 0 })),
          supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(5).then((r) => r.data ?? []),
          supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
        ]);
        setStats(s);
        setUsers(u ?? []);
        setAdmins(a ?? []);
        setMemberGrowth(mg);
        setContributionTrend(ct);
        setTontineStatus(ts);
        setAuditEvents(events);
        setAuditToday(todayCount ?? 0);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tontineStatusData = [
    { name: fr ? "Ouvertes" : "Open", value: tontineStatus.open, color: "#4CAF68" },
    { name: fr ? "Actives" : "Active", value: tontineStatus.active, color: "#6E3A9A" },
    { name: fr ? "Clôturées" : "Closed", value: tontineStatus.closed, color: "#9CA3AF" },
  ].filter((d) => d.value > 0);

  const activeAdmins = admins.filter((a: any) => a.is_active === true || a.is_active === "true").length;
  const totalAdmins = admins.length;
  const activeUsers = users.filter((u: any) => u.status === "active").length;

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
      value: (stats?.memberCount ?? 0).toLocaleString(),
      sub: `${activeUsers} ${fr ? "actifs" : "active"}`,
      icon: Users, color: "#4CAF68", bg: "#E8F5EC",
    },
    {
      label: fr ? "Administrateurs" : "Total Administrators",
      value: `${activeAdmins} ${fr ? "actifs" : "active"} / ${totalAdmins} ${fr ? "total" : "total"}`,
      sub: `${admins.filter((a: any) => a.roles?.name === "super_admin" && a.is_active).length} super admin · ${admins.filter((a: any) => a.roles?.name === "admin" && a.is_active).length} admin`,
      icon: UserCog, color: "#6E3A9A", bg: "#F0E8FF",
    },
    {
      label: fr ? "Tontines totales" : "Total Tontines",
      value: `${stats?.tontineCount ?? 0} ${fr ? "total" : "total"}`,
      sub: `${stats?.tontineCount ?? 0} ${fr ? "tontines" : "tontines"}`,
      icon: TrendingUp, color: "#4CAF68", bg: "#E8F5EC",
    },
    {
      label: fr ? "Épargne totale" : "Total Savings",
      value: stats ? formatXAF(stats.totalSavings) : "—",
      sub: fr ? "Toutes les comptes" : "All accounts",
      icon: Wallet, color: "#4CAF68", bg: "#E8F5EC",
    },
  ];

  const kpiRow2 = [
    {
      label: fr ? "Utilisateurs actifs" : "Active Users",
      value: `${activeUsers}`,
      sub: fr ? "Actuellement actif" : "Currently active",
      icon: BarChart3, color: "#6E3A9A", bg: "#F0E8FF",
    },
    {
      label: fr ? "Administrateurs actifs" : "Active Admins",
      value: `${activeAdmins} ${fr ? "actifs" : "active"}`,
      sub: fr ? "Gestion de la plateforme" : "Platform management",
      icon: Mail, color: "#F2994A", bg: "#FFF3E0",
    },
    {
      label: fr ? "Santé du système" : "System Health",
      value: "N/A",
      sub: fr ? "Opérationnel" : "Operational",
      icon: Activity, color: "#4CAF68", bg: "#E8F5EC",
    },
    {
      label: fr ? "Comptes courants" : "Current accounts",
      value: stats ? formatXAF(stats.total_current ?? 0) : "—",
      sub: fr ? "Solde total" : "Total balance",
      icon: CreditCard, color: "#2F80ED", bg: "#E7F0FE",
    },
  ];

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-red-500">{fr ? "Erreur de chargement des données" : "Error loading dashboard data"}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
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

      {/* Row 2 - 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiRow2.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{kpi.value}</p>
            <p className="text-xs mt-1 text-muted-foreground">{kpi.sub}</p>
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
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={memberGrowth}>
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
            <BarChart data={contributionTrend}>
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
              <Pie data={tontineStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {tontineStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {tontineStatusData.length === 0 ? (
              <p className="text-xs text-muted-foreground">{fr ? "Aucune donnée" : "No data"}</p>
            ) : (
              tontineStatusData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Events */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSearch size={16} className="text-muted-foreground" />
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Événements d'audit" : "Audit Events"}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{auditEvents.length}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{auditToday} {fr ? "aujourd'hui" : "today"}</span>
          </div>
          <div className="space-y-1.5">
            {auditEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">{fr ? "Aucun événement d'audit" : "No audit events"}</p>
            ) : (
              auditEvents.map((ev: any) => (
                <div key={ev.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                  <span className="text-xs font-medium truncate">{ev.action}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{new Date(ev.created_at).toLocaleDateString(fr ? "fr-FR" : "en-US")}</span>
                </div>
              ))
            )}
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
            {admins.length === 0 && (
              <p className="text-xs text-muted-foreground">{fr ? "Aucun administrateur" : "No administrators"}</p>
            )}
            {admins.map((admin: any) => (
              <div
                key={admin.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/admins")}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: "#6E3A9A" }}
                >
                  {(admin.full_name || admin.name || admin.email || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{admin.first_name || admin.name || admin.email}</p>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${admin.is_active ? "bg-[#4CAF68]" : "bg-red-400"}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{admin.email}</span>
                    {roleBadge((admin as any).roles?.name || "admin")}
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
