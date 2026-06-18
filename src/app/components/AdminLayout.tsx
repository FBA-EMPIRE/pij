import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, ShieldCheck, Wallet, TrendingUp,
  FileText, ScrollText, Settings, LogOut, Menu, X,
  ChevronRight, Sun, Moon, Bell, Shield, BookOpen, UserCog
} from "lucide-react";
import { PIJLogo } from "./PIJLogo";

interface AdminLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDark: () => void;
  lang: "fr" | "en";
  onToggleLang: () => void;
}

const navGroups = [
  {
    group: "Vue d'ensemble",
    groupEn: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Tableau de bord", labelEn: "Dashboard", path: "/admin/dashboard" },
    ],
  },
  {
    group: "Membres",
    groupEn: "Members",
    items: [
      { icon: Users, label: "Gestion membres", labelEn: "User Management", path: "/admin/users" },
      { icon: ShieldCheck, label: "File KYC", labelEn: "KYC Queue", path: "/admin/kyc" },
    ],
  },
  {
    group: "Finances",
    groupEn: "Finance",
    items: [
      { icon: Wallet, label: "Comptes", labelEn: "Accounts", path: "/admin/accounts" },
      { icon: TrendingUp, label: "Tontines", labelEn: "Tontines", path: "/admin/tontines" },
      { icon: BookOpen, label: "Formations", labelEn: "Formations", path: "/admin/formations" },
      { icon: TrendingUp, label: "Investissements", labelEn: "Investments", path: "/admin/investissements" },
    ],
  },
  {
    group: "Analytiques",
    groupEn: "Analytics",
    items: [
      { icon: FileText, label: "Rapports", labelEn: "Reports", path: "/admin/reports" },
      { icon: Shield, label: "System Audit", labelEn: "System Audit", path: "/admin/system-audit" },
    ],
  },
  {
    group: "Système",
    groupEn: "System",
    items: [
      { icon: UserCog, label: "Administrateurs", labelEn: "Admins", path: "/admin/admins" },
      { icon: Settings, label: "Paramètres", labelEn: "Settings", path: "/admin/settings" },
    ],
  },
];

export function AdminLayout({ children, darkMode, onToggleDark, lang, onToggleLang }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo + badge */}
        <div className="flex items-center justify-between p-5 h-16 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <PIJLogo variant="full" size="sm" theme="dark" />
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#6E3A9A]/20 text-[#9B6FCA]">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 mb-1 text-xs uppercase tracking-widest" style={{ color: "rgba(244,245,247,0.35)" }}>
                {lang === "fr" ? group.group : group.groupEn}
              </p>
              {group.items.map((item) => {
                  const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all
                      ${active
                        ? "bg-[#4CAF68]/15 text-[#4CAF68] font-medium"
                        : "hover:text-white"
                      }`}
                    style={{ color: active ? undefined : "rgba(244,245,247,0.65)" }}
                  >
                    <item.icon size={16} />
                    {lang === "fr" ? item.label : item.labelEn}
                    {active && <ChevronRight size={12} className="ml-auto" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <button onClick={() => navigate("/admin/profile")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 hover:opacity-80 transition-opacity" style={{ background: "var(--sidebar-accent)" }}>
            <div className="w-7 h-7 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">KA</div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-white truncate">Koné Aminata</p>
              <p className="text-xs" style={{ color: "rgba(244,245,247,0.5)" }}>Super Admin</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 w-full transition-all"
          >
            <LogOut size={15} />
            {lang === "fr" ? "Déconnexion" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen bg-background">
        <header className="sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground/70" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="hidden lg:inline text-sm text-muted-foreground">
              {lang === "fr" ? "Portail Administrateur" : "Admin Portal"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate("/admin/notifications")} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#4CAF68] rounded-full"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
