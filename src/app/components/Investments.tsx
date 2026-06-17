import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BarChart3, CheckCircle, ChevronDown, ChevronRight, Filter, Heart, Plus, Shield, TrendingUp, Wallet } from "lucide-react";
import { INVESTMENT_OPPORTUNITIES, INVESTMENT_PORTFOLIO, INVESTMENT_REQUESTS, INVESTMENT_WALLET, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface InvestmentsProps { lang?: "fr" | "en"; view?: "marketplace" | "detail" | "portfolio" | "wallet"; }

const sectors = ["Tous les secteurs", "Agriculture", "Technologie", "Énergie"];
const risks = ["Tous les risques", "Faible", "Modéré", "Élevé"];

export default function Investments({ lang = "fr", view = "marketplace" }: InvestmentsProps) {
  if (view === "detail") return <InvestmentDetail lang={lang} />;
  if (view === "portfolio") return <InvestmentPortfolio lang={lang} />;
  if (view === "wallet") return <InvestmentWallet lang={lang} />;
  return <InvestmentMarketplace lang={lang} />;
}

function InvestmentMarketplace({ lang }: { lang: "fr" | "en" }) {
  const fr = lang === "fr";
  const navigate = useNavigate();
  const [sector, setSector] = useState(sectors[0]);
  const [risk, setRisk] = useState(risks[0]);
  return <div className="p-4 lg:p-8 max-w-6xl mx-auto"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8"><div><h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Marketplace d'Investissement" : "Investment Marketplace"}</h1><p className="text-sm text-muted-foreground max-w-lg">{fr ? "Découvrez des projets vérifiés, transparents et alignés avec la croissance entrepreneuriale locale." : "Discover verified, transparent projects aligned with local entrepreneurial growth."}</p></div><div className="flex flex-col sm:flex-row gap-2"><button onClick={() => navigate("/investissements/portfolio")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}><TrendingUp size={16} />{fr ? "Mon portfolio" : "My portfolio"}</button><button onClick={() => navigate("/investissements/wallet")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted"><Wallet size={16} />Wallet</button></div></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Disponible" : "Available"} value={formatXAF(INVESTMENT_WALLET.available)} /><SummaryCard label={fr ? "Investi" : "Invested"} value={formatXAF(INVESTMENT_WALLET.invested)} /><SummaryCard label={fr ? "Gains" : "Earnings"} value={`+${formatXAF(INVESTMENT_WALLET.earnings)}`} positive /></div><div className="flex flex-wrap items-center gap-3 mb-6"><div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium"><Filter size={14} />{fr ? "Filtres :" : "Filters:"}</div><Select value={sector} onChange={setSector} options={sectors} /><Select value={risk} onChange={setRisk} options={risks} /><div className="ml-auto text-sm text-muted-foreground hidden sm:block">{fr ? "Priorité:" : "Priority:"} <span className="font-bold text-[#4CAF68]">{fr ? "Projets vérifiés" : "Verified projects"}</span></div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">{INVESTMENT_OPPORTUNITIES.map((opportunity) => <InvestmentCard key={opportunity.id} opportunity={opportunity} lang={lang} />)}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><InfoCard icon={Shield} title={fr ? "Approbation administrative" : "Admin approval"} text={fr ? "Chaque investissement reste en attente jusqu'à validation par l'équipe PIJ." : "Each investment remains pending until PIJ admin validation."} /><InfoCard icon={Heart} title={fr ? "Impact communautaire" : "Community impact"} text={fr ? "Les opportunités soutiennent directement les jeunes entrepreneurs et producteurs locaux." : "Opportunities directly support young entrepreneurs and local producers."} /></div></div>;
}

function InvestmentCard({ opportunity, lang }: { opportunity: typeof INVESTMENT_OPPORTUNITIES[number]; lang: "fr" | "en" }) {
  const fr = lang === "fr";
  const navigate = useNavigate();
  const progress = Math.round((opportunity.raised / opportunity.goal) * 100);
  return <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all"><div className="relative h-48" style={{ background: opportunity.image }}><div className="absolute inset-0 bg-black/10 group-hover:bg-black/5" /><span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-white text-xs font-bold bg-[#4CAF68]">{opportunity.category}</span><span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/90 text-xs font-bold">ROI: {opportunity.roi}</span></div><div className="p-5"><h3 className="text-base font-bold mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? opportunity.title : opportunity.titleEn}</h3><p className="text-xs text-muted-foreground leading-relaxed mb-4">{opportunity.description}</p><div className="grid grid-cols-3 gap-2 text-xs mb-4"><Mini label="ROI" value={opportunity.roi} /><Mini label={fr ? "Durée" : "Duration"} value={opportunity.duration} /><Mini label={fr ? "Risque" : "Risk"} value={opportunity.risk} /></div><div className="flex items-center justify-between text-xs mb-1.5"><span className="text-muted-foreground">{fr ? "Objectif" : "Goal"}: <span className="font-bold text-foreground">{formatXAF(opportunity.goal)}</span></span><span className="font-bold text-[#4CAF68]">{progress}%</span></div><div className="w-full bg-muted rounded-full h-2 mb-4"><div className="h-2 rounded-full bg-[#4CAF68]" style={{ width: `${progress}%` }} /></div><button onClick={() => navigate(`/investissements/${opportunity.id}`)} className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>{fr ? "Voir détails" : "View details"}</button></div></div>;
}

function InvestmentDetail({ lang }: { lang: "fr" | "en" }) {
  const fr = lang === "fr";
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("100000");
  const opportunity = INVESTMENT_OPPORTUNITIES.find((o) => o.id === id) ?? INVESTMENT_OPPORTUNITIES[0];
  const progress = Math.round((opportunity.raised / opportunity.goal) * 100);
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate("/investissements")} className="text-sm text-[#4CAF68] mb-4 hover:underline">← {fr ? "Retour au marketplace" : "Back to marketplace"}</button><div className="bg-card rounded-2xl border border-border overflow-hidden mb-6"><div className="h-56" style={{ background: opportunity.image }} /><div className="p-6"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><StatusBadge status={opportunity.status as any} size="sm" /><h1 className="text-2xl font-bold mt-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? opportunity.title : opportunity.titleEn}</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">{opportunity.description}</p></div><div className="bg-muted/40 rounded-2xl p-4 min-w-56"><p className="text-xs text-muted-foreground">{fr ? "Rendement attendu" : "Expected ROI"}</p><p className="text-3xl font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{opportunity.roi}</p><p className="text-xs text-muted-foreground mt-1">{opportunity.duration}</p></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"><Stat label={fr ? "Risque" : "Risk"} value={opportunity.risk} /><Stat label={fr ? "Minimum" : "Minimum"} value={formatXAF(opportunity.minAmount)} /><Stat label={fr ? "Maximum" : "Maximum"} value={formatXAF(opportunity.maxAmount)} /><Stat label={fr ? "Collecté" : "Raised"} value={`${progress}%`} /></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"><h2 className="text-lg font-bold mb-4">{fr ? "Transparence du projet" : "Project transparency"}</h2><div className="space-y-3">{[fr ? "Projet audité avant publication" : "Audited before publishing", fr ? "Suivi des performances disponible dans le portfolio" : "Performance tracking available in portfolio", fr ? "Validation administrative avant débit final" : "Admin approval before final debit"].map((x) => <div key={x} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle size={16} color="#4CAF68" />{x}</div>)}</div></div><div className="bg-card rounded-2xl border border-border p-6"><h2 className="text-lg font-bold mb-4">{fr ? "Investir maintenant" : "Invest now"}</h2><label className="text-sm font-medium">{fr ? "Montant" : "Amount"}</label><input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" /><p className="text-xs text-muted-foreground mt-2">{fr ? "La demande sera soumise à approbation admin." : "Request will be submitted for admin approval."}</p><button className="mt-4 w-full px-4 py-3 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Soumettre la demande" : "Submit request"}</button></div></div></div>;
}

function InvestmentPortfolio({ lang }: { lang: "fr" | "en" }) {
  const fr = lang === "fr";
  const total = INVESTMENT_PORTFOLIO.reduce((sum, p) => sum + p.amount, 0);
  const current = INVESTMENT_PORTFOLIO.reduce((sum, p) => sum + p.currentValue, 0);
  const returns = INVESTMENT_PORTFOLIO.reduce((sum, p) => sum + p.returns, 0);
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Portfolio d'investissement" : "Investment portfolio"}</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Suivez les investissements actifs, terminés et les rendements." : "Track active, completed investments and returns."}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Total investi" : "Total invested"} value={formatXAF(total)} /><SummaryCard label={fr ? "Valeur actuelle" : "Current value"} value={formatXAF(current)} /><SummaryCard label={fr ? "Rendements" : "Returns"} value={`+${formatXAF(returns)}`} positive /></div><div className="bg-card rounded-2xl border border-border p-5"><h2 className="text-lg font-bold mb-4">{fr ? "Mes investissements" : "My investments"}</h2><div className="space-y-3">{INVESTMENT_PORTFOLIO.map((p) => <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-muted/30"><div className="flex-1"><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{fr ? "Depuis" : "Since"} {p.started}</p></div><Mini label={fr ? "Investi" : "Invested"} value={formatXAF(p.amount)} /><Mini label={fr ? "Valeur" : "Value"} value={formatXAF(p.currentValue)} /><Mini label={fr ? "Retour" : "Return"} value={`+${formatXAF(p.returns)}`} /><StatusBadge status={p.status as any} size="sm" /></div>)}</div></div></div>;
}

function InvestmentWallet({ lang }: { lang: "fr" | "en" }) {
  const fr = lang === "fr";
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Wallet</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Solde disponible, capital investi et gains." : "Available balance, invested balance and earnings."}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Solde disponible" : "Available balance"} value={formatXAF(INVESTMENT_WALLET.available)} /><SummaryCard label={fr ? "Solde investi" : "Invested balance"} value={formatXAF(INVESTMENT_WALLET.invested)} /><SummaryCard label={fr ? "Gains" : "Earnings"} value={`+${formatXAF(INVESTMENT_WALLET.earnings)}`} positive /></div><div className="bg-card rounded-2xl border border-border p-5"><h2 className="text-lg font-bold mb-4">{fr ? "Demandes en cours" : "Pending requests"}</h2><div className="space-y-3">{INVESTMENT_REQUESTS.map((r) => <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30"><div className="w-10 h-10 rounded-xl bg-[#E8F5EC] flex items-center justify-center"><BarChart3 size={18} color="#4CAF68" /></div><div className="flex-1"><p className="text-sm font-medium">{r.opportunity}</p><p className="text-xs text-muted-foreground">{formatXAF(r.amount)} · {r.submitted}</p></div><StatusBadge status={r.status as any} size="sm" /></div>)}</div></div></div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" /></div>;
}

function SummaryCard({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="bg-card rounded-2xl border border-border p-5"><p className="text-sm text-muted-foreground mb-1">{label}</p><p className={`text-2xl font-bold ${positive ? "text-[#1F9D55]" : ""}`} style={{ fontFamily: "Geist Mono, monospace" }}>{value}</p></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{value}</p></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{value}</p></div>;
}

function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return <div className="bg-card rounded-2xl border border-border p-6 flex gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8F5EC" }}><Icon size={18} color="#4CAF68" /></div><div><p className="text-sm font-semibold mb-1">{title}</p><p className="text-xs text-muted-foreground leading-relaxed">{text}</p></div></div>;
}
