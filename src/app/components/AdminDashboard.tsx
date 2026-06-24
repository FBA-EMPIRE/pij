import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, ShieldCheck, TrendingUp, Wallet, ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { fetchDashboardStats, fetchUsers, fetchKycQueue } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const [stats, setStats] = useState<{ memberCount: number; tontineCount: number; totalSavings: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, u, k] = await Promise.all([
          fetchDashboardStats(),
          fetchUsers(),
          fetchKycQueue(),
        ]);
        setStats(s);
        setUsers(u);
        setKycQueue(k);
      } catch {
        setError(true);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const pendingKyc = kycQueue.length;
  const activeUsers = users.filter((u: any) => u.status === "active").length;

  const kpis = [
    { label: fr ? "Membres totaux" : "Total members", value: (stats?.memberCount ?? 0).toLocaleString(), sub: `${activeUsers} ${fr ? "actifs" : "active"}`, icon: Users, color: "#4CAF68", bg: "#E8F5EC" },
    { label: fr ? "KYC en attente" : "Pending KYC", value: pendingKyc, sub: fr ? "À traiter" : "To process", icon: ShieldCheck, color: "#F2994A", bg: "#FFF3E0", urgent: true },
    { label: fr ? "Tontines actives" : "Active tontines", value: stats?.tontineCount ?? 0, sub: fr ? "En cours" : "In progress", icon: TrendingUp, color: "#6E3A9A", bg: "#F0E8FF" },
    { label: fr ? "Épargne totale" : "Total savings", value: stats ? formatXAF(stats.totalSavings) : "—", sub: fr ? "Toutes les comptes" : "All accounts", icon: Wallet, color: "#4CAF68", bg: "#E8F5EC" },
  ];

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-red-500">{fr ? "Erreur de chargement des données" : "Error loading dashboard data"}</p>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
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
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={[]}>
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
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000000).toFixed(1)}M XAF`]} />
              <Bar dataKey="amount" fill="#4CAF68" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tontine status donut */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="mb-5" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Statut des Tontines" : "Tontine Status"}</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={[]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">{fr ? "Aucune donnée" : "No data"}</p>
          </div>
        </div>

        {/* KYC pending */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "File KYC" : "KYC Queue"}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">{kycQueue.length}</span>
            </div>
            <button onClick={() => navigate("/admin/kyc")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">
              {fr ? "Voir tout" : "View all"} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {kycQueue.map((kyc: any) => (
              <div key={kyc.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => navigate("/admin/kyc")}>
                <div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {((kyc.full_name || kyc.name || kyc.email || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{kyc.full_name || kyc.name || kyc.email}</p>
                  <p className="text-xs text-muted-foreground">{kyc.id_type || kyc.kyc_status || "—"} · {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString("fr-FR") : "—"}</p>
                </div>
                <StatusBadge status={kyc.kyc_status || "pending"} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent members */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Membres récents" : "Recent members"}</h3>
          <button onClick={() => navigate("/admin/users")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">
            {fr ? "Tout voir" : "View all"} <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="pb-3 text-left">UID</th>
                <th className="pb-3 text-left">{fr ? "Nom" : "Name"}</th>
                <th className="pb-3 text-left">{fr ? "Téléphone" : "Phone"}</th>
                <th className="pb-3 text-left">KYC</th>
                <th className="pb-3 text-left">{fr ? "Statut" : "Status"}</th>
                <th className="pb-3 text-right">{fr ? "Épargne" : "Savings"}</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((m: any) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => navigate("/admin/users")}>
                  <td className="py-3 text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{m.id?.slice(0, 8) || m.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">
                        {(m.full_name || m.name || m.email || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium">{m.full_name || m.name || m.email}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{m.phone || "—"}</td>
                  <td className="py-3"><StatusBadge status={(m.kyc_status || "pending") as any} size="sm" /></td>
                  <td className="py-3"><StatusBadge status={(m.status || "active") as any} size="sm" /></td>
                  <td className="py-3 text-right text-sm font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>
                    {m.balance_savings ? formatXAF(m.balance_savings) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
