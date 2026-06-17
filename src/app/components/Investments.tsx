import { useState } from "react";
import {
  TrendingUp, Filter, ChevronDown, BarChart3, Shield,
  CheckCircle, Users, Heart, Plus, Wallet
} from "lucide-react";

interface InvestmentsProps {
  lang?: "fr" | "en";
}

const SECTORS = [
  { value: "all", label: "Tous les secteurs", labelEn: "All sectors" },
  { value: "agriculture", label: "Agriculture", labelEn: "Agriculture" },
  { value: "technologie", label: "Technologie", labelEn: "Technology" },
  { value: "energie", label: "Énergie", labelEn: "Energy" },
  { value: "sante", label: "Santé", labelEn: "Health" },
];

const RISK_LEVELS = [
  { value: "all", label: "Tous les risques", labelEn: "All risks" },
  { value: "low", label: "Faible", labelEn: "Low" },
  { value: "moderate", label: "Modéré", labelEn: "Moderate" },
  { value: "high", label: "Élevé", labelEn: "High" },
];

const PROJECTS = [
  {
    id: 1,
    title: "Coopérative Cacao Douala",
    titleEn: "Douala Cocoa Cooperative",
    desc: "Modernisation des équipements de séchage pour 50 petits exploitants d...",
    descEn: "Modernizing drying equipment for 50 small farmers...",
    sector: "AGRICULTURE",
    sectorColor: "#4CAF68",
    roi: "12%",
    objectif: 5000000,
    progress: 75,
    risk: "Faible",
    riskEn: "Low",
    image: "linear-gradient(135deg, #2d5a27 0%, #4a7c44 50%, #6b9e65 100%)",
  },
  {
    id: 2,
    title: "FinTech Jeune Yaoundé",
    titleEn: "FinTech Youth Yaoundé",
    desc: "Développement d'une application de micro-crédit instantané pour les...",
    descEn: "Development of an instant micro-credit application for...",
    sector: "TECHNOLOGIE",
    sectorColor: "#6E3A9A",
    roi: "18%",
    objectif: 12000000,
    progress: 42,
    risk: "Modéré",
    riskEn: "Moderate",
    image: "linear-gradient(135deg, #1a2a4a 0%, #2d4a6a 50%, #4a6a8a 100%)",
  },
  {
    id: 3,
    title: "Solaire pour le Nord",
    titleEn: "Solar for the North",
    desc: "Installation de kits solaires résidentiels dans 3 villages de l'Extrême-Nord.",
    descEn: "Installation of residential solar kits in 3 villages in the Far North.",
    sector: "ÉNERGIE",
    sectorColor: "#E8A317",
    roi: "10%",
    objectif: 8500000,
    progress: 90,
    risk: "Faible",
    riskEn: "Low",
    image: "linear-gradient(135deg, #5a3a0a 0%, #8a5a1a 50%, #c48a2a 100%)",
  },
  {
    id: 4,
    title: "Clinique Mobile Digitale",
    titleEn: "Digital Mobile Clinic",
    desc: "Équipement de deux camions en unités de soins intensifs connectées par...",
    descEn: "Equipping two trucks as intensive care units connected by...",
    sector: "SANTÉ",
    sectorColor: "#1F9D55",
    roi: "15%",
    objectif: 15000000,
    progress: 15,
    risk: "Modéré",
    riskEn: "Moderate",
    image: "linear-gradient(135deg, #0a3a2a 0%, #1a5a4a 50%, #2a7a6a 100%)",
  },
];

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function Investments({ lang = "fr" }: InvestmentsProps) {
  const fr = lang === "fr";
  const [sectorFilter, setSectorFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Marketplace d'Investissement" : "Investment Marketplace"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            {fr
              ? "Découvrez des projets communautaires à fort impact et participez à la croissance de l'économie locale du Cameroun."
              : "Discover high-impact community projects and participate in the growth of Cameroon's local economy."}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 shrink-0" style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}>
          <TrendingUp size={16} />
          {fr ? "Épargner pour un investissement" : "Save for an investment"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium">
          <Filter size={14} />
          {fr ? "Filtres :" : "Filters:"}
        </div>
        <div className="relative">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
          >
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>{fr ? s.label : s.labelEn}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>{fr ? r.label : r.labelEn}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {fr ? "Trier par:" : "Sort by:"}{" "}
          <span className="font-bold text-[#4CAF68]">{fr ? "Plus récents" : "Most recent"}</span>
          <ChevronDown size={12} className="inline ml-1" />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {PROJECTS.map((project) => (
          <div key={project.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all">
            {/* Image */}
            <div className="relative h-48 overflow-hidden" style={{ background: project.image }}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-md text-white text-xs font-bold" style={{ background: project.sectorColor }}>
                  {project.sector}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/90 text-xs font-bold text-foreground backdrop-blur-sm">
                ROI: {project.roi}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-base font-bold mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {fr ? project.title : project.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {fr ? project.desc : project.descEn}
              </p>

              {/* Objective + Progress */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">
                  {fr ? "Objectif:" : "Goal:"}{" "}
                  <span className="font-bold text-foreground">{formatFCFA(project.objectif)} FCFA</span>
                </span>
                <span className="font-bold" style={{ color: "#4CAF68" }}>{project.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%`, background: "#4CAF68" }}
                />
              </div>

              {/* Risk + CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart3 size={14} />
                  {fr ? "Risque:" : "Risk:"}{" "}
                  <span className="font-medium text-foreground">{fr ? project.risk : project.riskEn}</span>
                </div>
                <button className="px-4 py-2 rounded-xl text-white text-xs font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
                  {fr ? "Investir maintenant" : "Invest now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Why invest */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-bold mb-5" style={{ fontFamily: "DM Sans, sans-serif", color: "#4CAF68" }}>
            {fr ? "Pourquoi investir sur PIJ ?" : "Why invest on PIJ?"}
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8F5EC" }}>
                <Shield size={18} color="#4CAF68" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{fr ? "Projets Vérifiés" : "Verified Projects"}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fr
                    ? "Chaque projet subit un audit rigoureux avant d'être publié."
                    : "Each project undergoes rigorous auditing before being published."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F0E8FF" }}>
                <Heart size={18} color="#6E3A9A" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{fr ? "Impact Communautaire" : "Community Impact"}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fr
                    ? "Votre argent soutient directement les entrepreneurs locaux."
                    : "Your money directly supports local entrepreneurs."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4CAF68 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {fr ? "VOTRE PORTFOLIO" : "YOUR PORTFOLIO"}
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: "Geist Mono, monospace", color: "#4CAF68" }}>
                  125,000 <span className="text-lg font-normal text-muted-foreground">FCFA</span>
                </p>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-medium transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
                <Plus size={14} />
                {fr ? "Nouveau Projet" : "New Project"}
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
              <Wallet size={16} />
              {fr ? "Gérer mon capital" : "Manage my capital"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
