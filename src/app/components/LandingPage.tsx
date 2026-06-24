import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Shield, TrendingUp, Users, Zap, Globe, ChevronDown, ChevronUp,
  CheckCircle, Star, Sun, Moon
} from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import heroBgImage from "../../../images/background 1.jpeg";
import { useAppContext } from "../context/AppContext";
import { fetchDashboardStats } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

const FEATURES = [
  { icon: Shield, title: "KYC Sécurisé", titleEn: "Secure KYC", desc: "Vérification d'identité numérique rapide et sécurisée pour accéder à tous les services PIJ.", descEn: "Fast, secure digital identity verification to access all PIJ services." },
  { icon: TrendingUp, title: "Objectifs d'Épargne", titleEn: "Savings Goals", desc: "Définissez vos cibles financières et suivez votre progression en temps réel.", descEn: "Set your financial targets and track your progress in real time." },
  { icon: Users, title: "Tontines Digitales", titleEn: "Digital Tontines", desc: "Participez à des tontines transparentes avec suivi visuel des contributions de chaque membre.", descEn: "Join transparent tontines with visual tracking of each member's contributions." },
  { icon: Zap, title: "Tableau de Bord", titleEn: "Dashboard", desc: "Visualisez vos comptes courant et épargne en temps réel avec historique complet.", descEn: "View your current and savings accounts in real time with full history." },
  { icon: Globe, title: "Bilingue EN/FR", titleEn: "EN/FR Bilingual", desc: "Plateforme entièrement disponible en français et en anglais.", descEn: "Platform fully available in French and English." },
  { icon: Star, title: "Rapport & Transparence", titleEn: "Reports & Transparency", desc: "Chaque transaction est enregistrée et consultable. Zéro ambiguïté.", descEn: "Every transaction is recorded and viewable. Zero ambiguity." },
];

const STEPS = [
  { num: "01", title: "Créer un groupe", titleEn: "Create a group", desc: "L'administrateur configure une tontine avec un montant, une fréquence et une capacité." },
  { num: "02", title: "Rejoindre", titleEn: "Join", desc: "Les membres s'inscrivent et règlent les frais d'entrée. Chaque place est confirmée." },
  { num: "03", title: "Cotiser", titleEn: "Contribute", desc: "Chaque cycle, tous les membres versent leur contribution. Le statut est visible en temps réel." },
  { num: "04", title: "Recevoir le tour", titleEn: "Receive the payout", desc: "À tour de rôle, chaque membre reçoit le pot commun. Ordre prédéfini, 100% transparent." },
];

const TESTIMONIALS = [
  { name: "Fatoumata K.", role: "Entrepreneuse, Yaoundé", text: "Grâce à la tontine PIJ, j'ai pu financer l'achat de matériel pour mon atelier de couture. La transparence du suivi est remarquable.", avatar: "FK", rating: 5 },
  { name: "Moussa T.", role: "Étudiant en commerce", text: "L'application est très intuitive. Je peux voir en temps réel si mes cotisations sont bien enregistrées et quand c'est mon tour.", avatar: "MT", rating: 5 },
  { name: "Aïssatou B.", role: "Commerçante", text: "PIJ a transformé notre groupe d'épargne traditionnel. Plus de disputes, plus de confusion — tout est enregistré numériquement.", avatar: "AB", rating: 5 },
];

const FAQS = [
  { q: "Comment fonctionne une tontine PIJ ?", qEn: "How does a PIJ tontine work?", a: "Une tontine PIJ est un groupe d'épargne rotatif. Chaque membre contribue à chaque cycle, et à tour de rôle, chaque membre reçoit le pot total. L'ordre est défini à l'avance et affiché publiquement.", aEn: "A PIJ tontine is a rotating savings group. Each member contributes each cycle, and in turn, each member receives the total pot. The order is predefined and publicly displayed." },
  { q: "Quels documents sont nécessaires pour s'inscrire ?", qEn: "What documents are required to register?", a: "Vous aurez besoin d'une pièce d'identité nationale (CNI, passeport ou permis de conduire) recto-verso et d'un selfie pour la vérification KYC.", aEn: "You will need a national ID document (national ID card, passport or driver's license) front and back, and a selfie for KYC verification." },
  { q: "Mes données financières sont-elles sécurisées ?", qEn: "Is my financial data secure?", a: "Oui. Toutes les données sont chiffrées et stockées sur des serveurs sécurisés. L'accès aux documents KYC est strictement contrôlé par URL signée à durée limitée.", aEn: "Yes. All data is encrypted and stored on secure servers. KYC document access is strictly controlled by limited-time signed URLs." },
  { q: "Quelles devises sont supportées ?", qEn: "What currencies are supported?", a: "La plateforme opère en Franc CFA (XAF) pour l'Afrique Centrale. D'autres devises seront ajoutées dans les phases futures.", aEn: "The platform operates in CFA Franc (XAF) for Central Africa. Other currencies will be added in future phases." },
];

export default function LandingPage() {
  const { darkMode, toggleDark, lang, toggleLang } = useAppContext();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const fr = lang === "fr";
  const [stats, setStats] = useState({ memberCount: 0, tontineCount: 0, totalSavings: 0 });

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""} style={{ fontFamily: "DM Sans, Inter, sans-serif" }}>
      <div className="min-h-screen bg-background text-foreground">

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
            <PIJLogo variant="full" size="md" theme={darkMode ? "dark" : "light"} />
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">{fr ? "Fonctionnalités" : "Features"}</a>
              <a href="#how" className="hover:text-foreground transition-colors">{fr ? "Comment ça marche" : "How it works"}</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">{fr ? "Témoignages" : "Testimonials"}</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={toggleLang} className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                {fr ? "EN" : "FR"}
              </button>
              <button onClick={toggleDark} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors hidden sm:block">
                {fr ? "Se connecter" : "Log in"}
              </button>
              <button onClick={() => navigate("/register")} className="px-4 py-2 text-sm rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ background: "#4CAF68" }}>
                {fr ? "S'inscrire" : "Sign up"}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden py-20 lg:py-32" style={{ minHeight: "80vh" }}>
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBgImage}
              alt=""
              className="w-full h-full"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(30,37,48,0.82) 0%, rgba(30,37,48,0.65) 40%, rgba(110,58,154,0.45) 100%)" }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4CAF68]/50 bg-[#4CAF68]/15 text-[#8FFFB0] text-xs font-medium mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF68] animate-pulse" />
                {fr ? "Plateforme digitale · Afrique Centrale" : "Digital Platform · Central Africa"}
              </div>
              <h1 className="mb-6 leading-tight" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#FFFFFF" }}>
                {fr ? "Investir aujourd'hui pour construire l'avenir" : "Invest today to build the future"}
              </h1>
              <p className="text-lg mb-8 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                {fr
                  ? "PIJ digitalise l'épargne communautaire et les tontines pour les jeunes entrepreneurs d'Afrique Centrale. Transparent, sécurisé, accessible."
                  : "PIJ digitizes community savings and tontines for young entrepreneurs in Central Africa. Transparent, secure, accessible."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate("/register")} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all hover:opacity-90 hover:shadow-xl" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
                  {fr ? "Commencer gratuitement" : "Get started free"}
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-6 mt-10 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                {[
                  { n: stats.memberCount.toLocaleString() + "+", l: fr ? "Membres actifs" : "Active members" },
                  { n: stats.tontineCount.toLocaleString(), l: fr ? "Tontines actives" : "Active tontines" },
                  { n: formatXAF(stats.totalSavings), l: fr ? "en épargne" : "in savings" },
                ].map((stat) => (
                  <div key={stat.l} className="flex items-center gap-2">
                    <span className="font-bold text-white" style={{ fontFamily: "Geist Mono, monospace" }}>{stat.n}</span>
                    <span>{stat.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Tout ce qu'il vous faut" : "Everything you need"}</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{fr ? "Une plateforme complète conçue pour l'entrepreneur africain d'aujourd'hui." : "A complete platform built for today's African entrepreneur."}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="p-6 rounded-2xl border border-border bg-background hover:border-[#4CAF68]/40 transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: "#E8F5EC" }}>
                    <f.icon size={20} color="#4CAF68" />
                  </div>
                  <h3 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? f.title : f.titleEn}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fr ? f.desc : f.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How tontines work */}
        <section id="how" className="py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Comment fonctionnent les tontines PIJ ?" : "How do PIJ tontines work?"}</h2>
              <p className="text-muted-foreground mt-2">{fr ? "Un processus simple, transparent et entièrement numérique." : "A simple, transparent, and fully digital process."}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.num} className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-px border-t-2 border-dashed border-[#4CAF68]/30 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(100% - 1.5rem)" }} />
                  )}
                  <div className="relative z-10 p-6 rounded-2xl bg-card border border-border">
                    <div className="text-3xl font-bold mb-3" style={{ fontFamily: "Geist Mono, monospace", color: "#4CAF68" }}>{step.num}</div>
                    <h4 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? step.title : step.titleEn}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contribution grid preview */}
            <div className="mt-14 p-8 rounded-2xl border border-border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-4 text-center">{fr ? "Exemple de grille de suivi des contributions" : "Example contribution tracking grid"}</p>
              <div className="overflow-x-auto">
                <div className="flex gap-1 mb-2 ml-28">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="w-8 text-center text-xs text-muted-foreground font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>S{i + 1}</div>
                  ))}
                </div>
                {[
                  { name: "Amara D.", paid: [1,1,1,1,1,1,1,1] },
                  { name: "Fatoumata K.", paid: [1,1,1,1,1,1,1,0] },
                  { name: "Moussa T.", paid: [1,1,1,1,1,1,0,0] },
                  { name: "Aïssatou B.", paid: [1,1,1,1,1,1,1,1] },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-1 mb-1">
                    <div className="w-28 text-xs text-muted-foreground truncate pr-2 text-right">{row.name}</div>
                    {row.paid.map((p, i) => (
                      <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${p ? "bg-[#4CAF68] text-white" : "bg-[#E5484D]/20 text-[#E5484D]"}`}>
                        {p ? "✓" : "✗"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Ce que disent nos membres" : "What our members say"}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="p-6 rounded-2xl border border-border bg-background">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#4CAF68" color="#4CAF68" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="max-w-3xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {fr ? faq.q : faq.qEn}
                    {openFaq === i ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {fr ? faq.a : faq.aEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <div className="p-12 rounded-3xl text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4CAF68 0%, #1F9D55 40%, #6E3A9A 100%)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)" }} />
              <div className="relative">
                <h2 className="text-white mb-3" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
                  {fr ? "Prêt à investir pour votre avenir ?" : "Ready to invest in your future?"}
                </h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto">
                  {fr ? `Rejoignez ${stats.memberCount} membres PIJ qui digitalisent leur épargne et leurs tontines dès aujourd'hui.` : `Join ${stats.memberCount} PIJ members who are digitalizing their savings and tontines today.`}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate("/register")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white font-medium text-sm transition-all hover:opacity-90" style={{ color: "#1F9D55" }}>
                    {fr ? "Créer mon compte" : "Create my account"}
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition-colors">
                    {fr ? "Se connecter" : "Log in"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <PIJLogo variant="full" size="sm" theme={darkMode ? "dark" : "light"} />
            <p>© 2026 Programme d'Investissement des Jeunes · {fr ? "Tous droits réservés" : "All rights reserved"}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">{fr ? "Confidentialité" : "Privacy"}</a>
              <a href="#" className="hover:text-foreground">{fr ? "Conditions" : "Terms"}</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
