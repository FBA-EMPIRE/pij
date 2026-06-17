import { useState } from "react";
import {
  Play, Clock, Star, BookOpen, Download, CheckCircle,
  ChevronRight, FileText, Send, Award
} from "lucide-react";

interface FormationsProps {
  lang?: "fr" | "en";
}

const FEATURED_COURSES = [
  {
    id: 1,
    category: "BUSINESS STRATEGY",
    categoryColor: "#1F9D55",
    title: "Fondements de l'Entrepreneuriat",
    titleEn: "Entrepreneurship Fundamentals",
    desc: "Maîtrisez les bases de la création d'entreprise : de l'idée au...",
    descEn: "Master the basics of creating a business: from idea to...",
    instructor: "Jean-Pierre M.",
    duration: "1h 45min",
    price: "Gratuit",
    priceEn: "Free",
    image: "linear-gradient(135deg, #2d5a27 0%, #4a7c44 50%, #6b9e65 100%)",
  },
  {
    id: 2,
    category: "FINANCE",
    categoryColor: "#4CAF68",
    title: "Gestion de Trésorerie",
    titleEn: "Cash Flow Management",
    desc: "Les outils indispensables pour piloter son cash-flow et assure...",
    descEn: "Essential tools to manage your cash flow and ensure...",
    instructor: "Aminata S.",
    duration: "2h 10min",
    price: "Inclus",
    priceEn: "Included",
    image: "linear-gradient(135deg, #1a3a4a 0%, #2d5a6a 50%, #4a7c8a 100%)",
  },
  {
    id: 3,
    category: "MARKETING",
    categoryColor: "#6E3A9A",
    title: "Marketing Digital Local",
    titleEn: "Local Digital Marketing",
    desc: "Comment acquérir vos 100 premiers clients en utilisant les...",
    descEn: "How to acquire your first 100 customers using...",
    instructor: "Marc O.",
    duration: "55min",
    price: "Populaire",
    priceEn: "Popular",
    image: "linear-gradient(135deg, #3d2a5c 0%, #5a4a7c 50%, #7a6a9c 100%)",
  },
];

const CONSULTATION_TYPES = [
  { value: "business-plan", label: "Aide au Business Plan", labelEn: "Business Plan Help" },
  { value: "fiscal", label: "Conseil Fiscal", labelEn: "Tax Advice" },
  { value: "legal", label: "Création d'Entreprise", labelEn: "Business Creation" },
  { value: "credit", label: "Demande de Micro-Crédit", labelEn: "Micro-Credit Application" },
];

export default function Formations({ lang = "fr" }: FormationsProps) {
  const fr = lang === "fr";
  const [consultationType, setConsultationType] = useState("business-plan");

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="mb-8 p-6 lg:p-8 rounded-2xl bg-card border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4CAF68 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
            <Play size={16} />
            {fr ? "Explorer les cours" : "Explore courses"}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm transition-all hover:bg-muted">
            <BookOpen size={16} />
            {fr ? "Bibliothèque" : "Library"}
          </button>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "DM Sans, sans-serif", color: "#4CAF68" }}>
              {fr ? "Formations à la une" : "Featured Courses"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {fr ? "Contenus vidéo haute définition par des experts." : "High definition video content by experts."}
            </p>
          </div>
          <button className="text-sm text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">
            {fr ? "Voir tout" : "View all"} <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {FEATURED_COURSES.map((course) => (
            <div key={course.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all cursor-pointer">
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden" style={{ background: course.image }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                  <Clock size={12} />
                  {course.duration}
                </div>
              </div>
              {/* Content */}
              <div className="p-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: course.categoryColor }}
                >
                  {course.category}
                </span>
                <h3 className="text-sm font-semibold mt-1.5 mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {fr ? course.title : course.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {fr ? course.desc : course.descEn}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star size={12} fill="#4CAF68" color="#4CAF68" />
                    {course.instructor}
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#4CAF68" }}>
                    {fr ? course.price : course.priceEn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Library */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "DM Sans, sans-serif", color: "#4CAF68" }}>
          {fr ? "Bibliothèque de Ressources" : "Resource Library"}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Guide Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#E8F5EC" }}>
              <BookOpen size={22} color="#4CAF68" />
            </div>
            <h3 className="text-base font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {fr ? "Le Guide Complet de l'Investisseur PIJ" : "The Complete PIJ Investor Guide"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {fr
                ? "Un ouvrage de 150 pages couvrant tout ce que vous devez savoir sur l'écosystème financier local, les garanties et les opportunités de croissance."
                : "A 150-page book covering everything you need to know about the local financial ecosystem, guarantees and growth opportunities."}
            </p>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={16} color="#4CAF68" />
                {fr ? "Modèles de Business Plan inclus" : "Business Plan templates included"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={16} color="#4CAF68" />
                {fr ? "Fiches pratiques de fiscalité" : "Practical tax worksheets"}
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
              <Download size={16} />
              {fr ? "Télécharger le Guide (PDF)" : "Download Guide (PDF)"}
            </button>
          </div>

          {/* Reflection + Quick Resources */}
          <div className="space-y-5">
            {/* Reflection Quote */}
            <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #6E3A9A 0%, #9B6FCA 100%)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-white/70">
                {fr ? "RÉFLEXION DU MOIS" : "REFLECTION OF THE MONTH"}
              </p>
              <p className="text-sm italic leading-relaxed mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                "{fr
                  ? "L'innovation ne naît pas de la complexité, mais de la résolution simple d'un problème quotidien."
                  : "Innovation doesn't come from complexity, but from simply solving an everyday problem."}"
              </p>
              <p className="text-xs text-white/60">— Editorial PIJ</p>
            </div>

            {/* Quick Resource Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5 text-center hover:border-[#4CAF68]/40 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "#E8F5EC" }}>
                  <FileText size={18} color="#4CAF68" />
                </div>
                <p className="text-xs font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {fr ? "Checklist: Création SARL" : "Checklist: LLC Creation"}
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5 text-center hover:border-[#4CAF68]/40 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "#F0E8FF" }}>
                  <Award size={18} color="#6E3A9A" />
                </div>
                <p className="text-xs font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {fr ? "Guide: Micro-Crédit" : "Guide: Micro-Credit"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Section */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Info */}
          <div className="p-8 text-white" style={{ background: "linear-gradient(135deg, #1F9D55 0%, #4CAF68 100%)" }}>
            <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {fr ? "Accompagnement Sur-Mesure" : "Custom Guidance"}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              {fr
                ? "Besoin d'aide pour structurer votre projet ou une assistance financière ? Réservez une consultation gratuite avec nos experts."
                : "Need help structuring your project or financial assistance? Book a free consultation with our experts."}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Clock size={16} />
                {fr ? "Disponibilité sous 48h" : "Available within 48h"}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle size={16} />
                {fr ? "Support multilingue" : "Multilingual support"}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 bg-card">
            <p className="text-sm font-medium text-muted-foreground mb-5">
              {fr ? "Demander un RDV pour assistance" : "Request an appointment for assistance"}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                  {fr ? "Nom Complet" : "Full Name"}
                </label>
                <input
                  placeholder={fr ? "Entrez votre nom" : "Enter your name"}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                  {fr ? "Numéro de Membre" : "Member Number"}
                </label>
                <input
                  placeholder="PIJ-XXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                {fr ? "Type de Consultation" : "Consultation Type"}
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 appearance-none"
              >
                {CONSULTATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {fr ? t.label : t.labelEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                {fr ? "Description courte du projet" : "Short project description"}
              </label>
              <textarea
                rows={3}
                placeholder={fr ? "Parlez-nous de votre besoin..." : "Tell us about your needs..."}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #1E2530, #2A3444)" }}>
              <Send size={16} />
              {fr ? "Envoyer la demande" : "Send request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
