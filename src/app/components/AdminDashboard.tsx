import { useNavigate } from "react-router";
import { Users, ShieldCheck, TrendingUp, Wallet, AlertCircle, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  ADMIN_KPI, MEMBERS, KYC_QUEUE, MEMBER_GROWTH_DATA,
  CONTRIBUTION_DATA, TONTINE_STATUS_DATA, KYC_TREND_DATA, formatXAF
} from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface AdminDashboardProps {
  lang?: "fr" | "en";
}

export default function AdminDashboard({ lang = "fr" }: AdminDashboardProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";

  const kpis = [
    { label: fr ? "Membres totaux" : "Total members", value: ADMIN_KPI.total_members.toLocaleString(), sub: `${ADMIN_KPI.active_members} ${fr ? "actifs" : "active"}`, icon: Users, color: "#4CAF68", bg: "#E8F5EC" },
    { label: fr ? "KYC en attente" : "Pending KYC", value: ADMIN_KPI.pending_kyc, sub: fr ? "À traiter" : "To process", icon: ShieldCheck, color: "#F2994A", bg: "#FFF3E0", urgent: true },
    { label: fr ? "Tontines actives" : "Active tontines", value: ADMIN_KPI.active_tontines, sub: fr ? "En cours" : "In progress", icon: TrendingUp, color: "#6E3A9A", bg: "#F0E8FF" },
    { label: fr ? "Épargne totale" : "Total savings", value: "284,5M XAF", sub: `+${ADMIN_KPI.monthly_growth}% ${fr ? "ce mois" : "this month"}`, icon: Wallet, color: "#4CAF68", bg: "#E8F5EC" },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tontine status donut */}
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

        {/* KYC pending */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "File KYC" : "KYC Queue"}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">{KYC_QUEUE.length}</span>
            </div>
            <button onClick={() => navigate("/admin/kyc")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">
              {fr ? "Voir tout" : "View all"} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {KYC_QUEUE.map((kyc) => (
              <div key={kyc.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => navigate("/admin/kyc")}>
                <div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {kyc.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{kyc.name}</p>
                  <p className="text-xs text-muted-foreground">{kyc.id_type} · {new Date(kyc.submitted).toLocaleDateString("fr-FR")}</p>
                </div>
                <StatusBadge status={kyc.priority as any} size="sm" />
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
              {MEMBERS.slice(0, 5).map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => navigate("/admin/users")}>
                  <td className="py-3 text-xs text-muted-foreground" style={{ fontFamily: "Geist Mono, monospace" }}>{m.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">
                        {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{m.phone}</td>
                  <td className="py-3"><StatusBadge status={m.kyc as any} size="sm" /></td>
                  <td className="py-3"><StatusBadge status={m.status as any} size="sm" /></td>
                  <td className="py-3 text-right text-sm font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>
                    {m.balance_savings > 0 ? formatXAF(m.balance_savings) : "—"}
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
