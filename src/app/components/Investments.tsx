import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BarChart3, ChevronDown, ChevronRight, Filter, Heart, TrendingUp, Wallet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { getCurrentUserId } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

interface InvestmentsProps { view?: "marketplace" | "detail" | "portfolio" | "wallet"; }

const sectors = ["Tous les secteurs", "Agriculture", "Technologie", "Énergie"];
const risks = ["Tous les risques", "Faible", "Modéré", "Élevé"];

export default function Investments({ view = "marketplace" }: InvestmentsProps) {
  const { lang } = useAppContext();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [walletData, setWalletData] = useState({ available: 0, invested: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        const [opps, port, reqs, { data: profile }] = await Promise.all([
          supabase.from("investment_opportunities").select("*"),
          supabase.from("investment_portfolio").select("*").eq("user_id", userId),
          supabase.from("investment_requests").select("*").eq("user_id", userId),
          supabase.from("users").select("balance_current, balance_investment").eq("id", userId).single(),
        ]);
        setOpportunities(opps.data ?? []);
        setPortfolio(port.data ?? []);
        setRequests(reqs.data ?? []);
        setWalletData({
          available: profile?.balance_current ?? 0,
          invested: profile?.balance_investment ?? 0,
          earnings: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (view === "detail") return <InvestmentDetail opportunities={opportunities} />;
  if (view === "portfolio") return <InvestmentPortfolio portfolio={portfolio} />;
  if (view === "wallet") return <InvestmentWallet walletData={walletData} requests={requests} />;
  return <InvestmentMarketplace opportunities={opportunities} walletData={walletData} />;
}

function InvestmentMarketplace({ opportunities, walletData }: { opportunities: any[]; walletData: { available: number; invested: number; earnings: number } }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const [sector, setSector] = useState(sectors[0]);
  const [risk, setRisk] = useState(risks[0]);
  return <div className="p-4 lg:p-8 max-w-6xl mx-auto"><button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8"><div><h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Marketplace d'Investissement" : "Investment Marketplace"}</h1><p className="text-sm text-muted-foreground max-w-lg">{fr ? "Découvrez des projets vérifiés, transparents et alignés avec la croissance entrepreneuriale locale." : "Discover verified, transparent projects aligned with local entrepreneurial growth."}</p></div><div className="flex flex-col sm:flex-row gap-2"><button onClick={() => navigate("/investissements/portfolio")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}><TrendingUp size={16} />{fr ? "Mon portfolio" : "My portfolio"}</button><button onClick={() => navigate("/investissements/wallet")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted"><Wallet size={16} />Wallet</button></div></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Disponible" : "Available"} value={formatXAF(walletData.available)} /><SummaryCard label={fr ? "Investi" : "Invested"} value={formatXAF(walletData.invested)} /><SummaryCard label={fr ? "Gains" : "Earnings"} value={`+${formatXAF(walletData.earnings)}`} positive /></div><div className="flex flex-wrap items-center gap-3 mb-6"><div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium"><Filter size={14} />{fr ? "Filtres :" : "Filters:"}</div><Select value={sector} onChange={setSector} options={sectors} /><Select value={risk} onChange={setRisk} options={risks} /><div className="ml-auto text-sm text-muted-foreground hidden sm:block">{fr ? "Priorité:" : "Priority:"} <span className="font-bold">{opportunities.length} {fr ? "projets" : "projects"}</span></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{opportunities.length ? opportunities.map((opp) => <InvestmentCard key={opp.id} opportunity={opp} />) : <p className="text-sm text-muted-foreground col-span-full text-center py-12">{fr ? "Aucune opportunité disponible" : "No opportunities available"}</p>}</div></div>;
}

function InvestmentCard({ opportunity }: { opportunity: any }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const progress = Math.round((opportunity.raised / opportunity.goal) * 100);
  return <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all"><div className="relative h-36 sm:h-48" style={{ background: opportunity.image }}><div className="absolute inset-0 bg-black/10 group-hover:bg-black/5" /><span className="absolute top-3 left-3 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md text-white text-xs font-bold bg-[#4CAF68]">{opportunity.category}</span><span className="absolute top-3 right-3 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-white/90 text-[10px] sm:text-xs font-bold">ROI: {opportunity.roi}</span></div><div className="p-4 sm:p-5"><h3 className="text-sm sm:text-base font-bold mb-1.5 truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? opportunity.title : opportunity.titleEn}</h3><p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">{opportunity.description}</p><div className="grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs mb-3 sm:mb-4"><Mini label="ROI" value={opportunity.roi} /><Mini label={fr ? "Durée" : "Duration"} value={opportunity.duration} /><Mini label={fr ? "Risque" : "Risk"} value={opportunity.risk} /></div><div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5"><span className="text-muted-foreground">{fr ? "Objectif" : "Goal"}: <span className="font-bold text-foreground">{formatXAF(opportunity.goal)}</span></span><span className="font-bold text-[#4CAF68]">{progress}%</span></div><div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4"><div className="h-1.5 sm:h-2 rounded-full bg-[#4CAF68]" style={{ width: `${progress}%` }} /></div><button onClick={() => navigate(`/investissements/${opportunity.id}`)} className="w-full px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium min-h-[44px]" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>{fr ? "Voir détails" : "View details"}</button></div></div>;
}

function InvestmentDetail({ opportunities }: { opportunities: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const opportunity = opportunities.find((o: any) => o.id === id) ?? opportunities[0];
  if (!opportunity) return <div className="p-8 text-center text-muted-foreground">{fr ? "Opportunité introuvable" : "Opportunity not found"}</div>;
  const progress = Math.round((opportunity.raised / opportunity.goal) * 100);
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button><div className="bg-card rounded-2xl border border-border overflow-hidden mb-6"><div className="h-44 sm:h-56" style={{ background: opportunity.image }} /><div className="p-4 sm:p-6"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><StatusBadge status={opportunity.status as any} size="sm" /><h1 className="text-xl sm:text-2xl font-bold mt-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? opportunity.title : opportunity.titleEn}</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">{opportunity.description}</p></div><div className="bg-muted/40 rounded-2xl p-4 min-w-40 sm:min-w-56"><p className="text-xs text-muted-foreground">{fr ? "Rendement attendu" : "Expected ROI"}</p><p className="text-2xl sm:text-3xl font-bold text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{opportunity.roi}</p><p className="text-xs text-muted-foreground mt-1">{opportunity.duration}</p></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-6"><Stat label={fr ? "Risque" : "Risk"} value={opportunity.risk} /><Stat label={fr ? "Minimum" : "Minimum"} value={formatXAF(opportunity.minAmount)} /><Stat label={fr ? "Maximum" : "Maximum"} value={formatXAF(opportunity.maxAmount)} /><Stat label={fr ? "Collecté" : "Raised"} value={`${progress}%`} /></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-card rounded-2xl border border-border p-4 sm:p-6"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Transparence du projet" : "Project transparency"}</h2><div className="space-y-3">{[fr ? "Projet audité avant publication" : "Audited before publishing", fr ? "Suivi des performances disponible dans le portfolio" : "Performance tracking available in portfolio"].map((t, i) => <div key={i} className="flex items-start gap-3"><div className="w-5 h-5 rounded-full bg-[#E8F5EC] flex items-center justify-center mt-0.5"><Heart size={10} color="#4CAF68" /></div><p className="text-xs sm:text-sm">{t}</p></div>)}</div></div><div className="bg-card rounded-2xl border border-border p-4 sm:p-6"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Investir" : "Invest"}</h2><p className="text-xs text-muted-foreground mb-3">{fr ? "Montant" : "Amount"}</p><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3" /><p className="text-xs text-muted-foreground mb-4">{fr ? "Minimum" : "Minimum"}: {formatXAF(opportunity.minAmount)} · {fr ? "Maximum" : "Maximum"}: {formatXAF(opportunity.maxAmount)}</p><button className="w-full px-4 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>{fr ? "Investir maintenant" : "Invest now"}</button></div></div></div>;
}

function InvestmentPortfolio({ portfolio }: { portfolio: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const total = portfolio.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
  const current = portfolio.reduce((sum: number, p: any) => sum + (p.currentValue ?? 0), 0);
  const returns = portfolio.reduce((sum: number, p: any) => sum + (p.returns ?? 0), 0);
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button><h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Portfolio d'investissement" : "Investment portfolio"}</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Suivez les investissements actifs, terminés et les rendements." : "Track active, completed investments and returns."}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Total investi" : "Total invested"} value={formatXAF(total)} /><SummaryCard label={fr ? "Valeur actuelle" : "Current value"} value={formatXAF(current)} /><SummaryCard label={fr ? "Rendements" : "Returns"} value={`+${formatXAF(returns)}`} positive /></div><div className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Mes investissements" : "My investments"}</h2><div className="space-y-3">{portfolio.length ? portfolio.map((p: any) => <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30"><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{p.title}</p><p className="text-[10px] sm:text-xs text-muted-foreground">{fr ? "Depuis" : "Since"} {p.started}</p></div><div className="flex flex-wrap items-center gap-3 sm:gap-4"><Mini label={fr ? "Investi" : "Invested"} value={formatXAF(p.amount)} /><Mini label={fr ? "Valeur" : "Value"} value={formatXAF(p.currentValue)} /><Mini label={fr ? "Retour" : "Return"} value={`+${formatXAF(p.returns)}`} /><StatusBadge status={p.status as any} size="sm" /></div></div>) : <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucun investissement" : "No investments yet"}</p>}</div></div></div>;
}

function InvestmentWallet({ walletData, requests }: { walletData: { available: number; invested: number; earnings: number }; requests: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button><h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Wallet</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Solde disponible, capital investi et gains." : "Available balance, invested balance and earnings."}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SummaryCard label={fr ? "Solde disponible" : "Available balance"} value={formatXAF(walletData.available)} /><SummaryCard label={fr ? "Solde investi" : "Invested balance"} value={formatXAF(walletData.invested)} /><SummaryCard label={fr ? "Gains" : "Earnings"} value={`+${formatXAF(walletData.earnings)}`} positive /></div><div className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Demandes en cours" : "Pending requests"}</h2><div className="space-y-3">{requests.length ? requests.map((r: any) => <div key={r.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/30"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#E8F5EC] flex items-center justify-center shrink-0"><BarChart3 size={14} className="sm:w-[18px] sm:h-[18px]" color="#4CAF68" /></div><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{r.opportunity}</p><p className="text-[10px] sm:text-xs text-muted-foreground">{formatXAF(r.amount)} · {r.submitted}</p></div><StatusBadge status={r.status as any} size="sm" /></div>) : <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Aucune demande en cours" : "No pending requests"}</p>}</div></div></div>;
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
