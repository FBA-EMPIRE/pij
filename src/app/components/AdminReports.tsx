import { useState, useCallback } from "react";
import { Download, FileText, TrendingUp, Users, Layers } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { MEMBER_GROWTH_DATA, CONTRIBUTION_DATA, KYC_TREND_DATA, ADMIN_KPI, formatXAF } from "./mockData";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/AppContext";

export default function AdminReports() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [activeReport, setActiveReport] = useState<"financial" | "members" | "tontines">("financial");

  const reportTypes = [
    { key: "financial", label: fr ? "Rapport Financier" : "Financial Report", icon: TrendingUp },
    { key: "members", label: fr ? "Rapport Membres" : "Member Report", icon: Users },
    { key: "tontines", label: fr ? "Rapport Tontines" : "Tontine Report", icon: Layers },
  ];

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().slice(0, 10);
    const reportName = reportTypes.find((r) => r.key === activeReport)?.label || "Report";
    doc.setFontSize(16);
    doc.text(`PIJ - ${reportName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`${fr ? "Généré le" : "Generated on"}: ${dateStr}`, 14, 28);

    if (activeReport === "financial") {
      doc.setFontSize(12);
      doc.text(`${fr ? "Épargne totale" : "Total savings"}: ${ADMIN_KPI.total_savings.toLocaleString()} XAF`, 14, 40);
      doc.text(`${fr ? "Comptes courants" : "Current accounts"}: ${ADMIN_KPI.total_current.toLocaleString()} XAF`, 14, 48);
      doc.text(`${fr ? "Taux de croissance" : "Growth rate"}: ${ADMIN_KPI.monthly_growth}%`, 14, 56);
      CONTRIBUTION_DATA.forEach((d, i) => {
        doc.text(`${d.month}: ${(d.amount / 1000000).toFixed(1)}M XAF`, 14, 68 + i * 7);
      });
    } else if (activeReport === "members") {
      doc.setFontSize(12);
      doc.text(`${fr ? "Total membres" : "Total members"}: ${ADMIN_KPI.total_members}`, 14, 40);
      doc.text(`${fr ? "Membres actifs" : "Active members"}: ${ADMIN_KPI.active_members}`, 14, 48);
      doc.text(`${fr ? "Taux KYC" : "KYC rate"}: ${ADMIN_KPI.kyc_approval_rate}%`, 14, 56);
      MEMBER_GROWTH_DATA.forEach((d, i) => {
        doc.text(`${d.month}: ${d.members}`, 14, 68 + i * 7);
      });
    } else {
      doc.setFontSize(12);
      doc.text(`${fr ? "Tontines actives" : "Active tontines"}: ${ADMIN_KPI.active_tontines}`, 14, 40);
      doc.text(`${fr ? "Taux de croissance" : "Growth rate"}: ${ADMIN_KPI.monthly_growth}%`, 14, 48);
    }
    doc.save(`PIJ_${reportName.replace(/\s+/g, "_")}_${dateStr}.pdf`);
  }, [activeReport, fr]);

  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);

    if (activeReport === "financial") {
      const data = [
        { [fr ? "Métrique" : "Metric"]: fr ? "Épargne totale" : "Total savings", [fr ? "Valeur" : "Value"]: `${ADMIN_KPI.total_savings.toLocaleString()} XAF` },
        { [fr ? "Métrique" : "Metric"]: fr ? "Comptes courants" : "Current accounts", [fr ? "Valeur" : "Value"]: `${ADMIN_KPI.total_current.toLocaleString()} XAF` },
        { [fr ? "Métrique" : "Metric"]: fr ? "Croissance mensuelle" : "Monthly growth", [fr ? "Valeur" : "Value"]: `${ADMIN_KPI.monthly_growth}%` },
        ...CONTRIBUTION_DATA.map((d) => ({ [fr ? "Mois" : "Month"]: d.month, [fr ? "Montant" : "Amount"]: d.amount })),
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, fr ? "Financier" : "Financial");
    } else if (activeReport === "members") {
      const data = [
        { [fr ? "Métrique" : "Metric"]: fr ? "Total membres" : "Total members", [fr ? "Valeur" : "Value"]: ADMIN_KPI.total_members },
        { [fr ? "Métrique" : "Metric"]: fr ? "Membres actifs" : "Active members", [fr ? "Valeur" : "Value"]: ADMIN_KPI.active_members },
        { [fr ? "Métrique" : "Metric"]: fr ? "Taux KYC" : "KYC rate", [fr ? "Valeur" : "Value"]: `${ADMIN_KPI.kyc_approval_rate}%` },
        ...MEMBER_GROWTH_DATA.map((d) => ({ [fr ? "Mois" : "Month"]: d.month, Membres: d.members })),
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, fr ? "Membres" : "Members");
    } else {
      const data = [
        { [fr ? "Métrique" : "Metric"]: fr ? "Tontines actives" : "Active tontines", [fr ? "Valeur" : "Value"]: ADMIN_KPI.active_tontines },
        { [fr ? "Métrique" : "Metric"]: fr ? "Taux de croissance" : "Growth rate", [fr ? "Valeur" : "Value"]: `${ADMIN_KPI.monthly_growth}%` },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, fr ? "Tontines" : "Tontines");
    }
    XLSX.writeFile(wb, `PIJ_${activeReport}_${dateStr}.xlsx`);
  }, [activeReport, fr]);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Rapports & Analytiques" : "Reports & Analytics"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{fr ? "Centre de rapports PIJ" : "PIJ reporting center"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download size={15} /> PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {reportTypes.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              activeReport === r.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <r.icon size={15} />
            {r.label}
          </button>
        ))}
      </div>

      {activeReport === "financial" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: fr ? "Épargne totale" : "Total savings", value: "284,5M XAF", sub: fr ? "Tous comptes épargne" : "All savings accounts" },
              { label: fr ? "Comptes courants" : "Current accounts", value: "97,2M XAF", sub: fr ? "Tous comptes courants" : "All current accounts" },
              { label: fr ? "Contributions tontines" : "Tontine contributions", value: "64,3M XAF", sub: fr ? "Juin 2024" : "June 2024" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-1 mb-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Contributions chart */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Contributions mensuelles" : "Monthly contributions"}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CONTRIBUTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000000).toFixed(1)}M XAF`]} />
                <Bar dataKey="amount" fill="#4CAF68" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === "members" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: fr ? "Total membres" : "Total members", value: "847" },
              { label: fr ? "Membres actifs" : "Active members", value: "712" },
              { label: fr ? "Taux approbation KYC" : "KYC approval rate", value: "94%" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Croissance des membres" : "Member growth"}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MEMBER_GROWTH_DATA}>
                  <defs><linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6E3A9A" stopOpacity={0.2} /><stop offset="95%" stopColor="#6E3A9A" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="members" stroke="#6E3A9A" strokeWidth={2} fill="url(#grad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Tendances KYC" : "KYC trends"}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={KYC_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="approved" fill="#4CAF68" radius={[3, 3, 0, 0]} name={fr ? "Approuvés" : "Approved"} />
                  <Bar dataKey="rejected" fill="#E5484D" radius={[3, 3, 0, 0]} name={fr ? "Rejetés" : "Rejected"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeReport === "tontines" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: fr ? "Tontines actives" : "Active tontines", value: "7" },
              { label: fr ? "Participants totaux" : "Total participants", value: "84" },
              { label: fr ? "Fonds sous gestion" : "Funds under management", value: "5,25M XAF" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-1" style={{ fontFamily: "Geist Mono, monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Taux de contribution par tontine" : "Contribution rate by tontine"}</h3>
            <p className="text-xs text-muted-foreground mb-4">{fr ? "Pourcentage des contributions payées vs attendues" : "Percentage of contributions paid vs expected"}</p>
            <div className="space-y-3">
              {[
                { name: "Tontine Alpha", rate: 87, paid: 70, total: 80 },
                { name: "Tontine Mensuelle Entrepreneurs", rate: 100, paid: 0, total: 0 },
                { name: "Tontine Jeunes Femmes", rate: 94, paid: 47, total: 50 },
              ].map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{t.name}</span>
                    <span className="font-bold" style={{ fontFamily: "Geist Mono, monospace", color: t.rate >= 90 ? "#4CAF68" : "#F2994A" }}>{t.rate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${t.rate}%`, background: t.rate >= 90 ? "#4CAF68" : "#F2994A" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
