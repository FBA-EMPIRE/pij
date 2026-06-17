import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, CreditCard, PiggyBank, Users, Bell, User,
  LogOut, Menu, X, Sun, Moon, ChevronRight,
  TrendingUp, Settings
} from "lucide-react";
import { PIJLogo } from "./PIJLogo";

interface MemberLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDark: () => void;
  lang: "fr" | "en";
  onToggleLang: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", labelEn: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Transactions", labelEn: "Transactions", path: "/transactions" },
  { icon: PiggyBank, label: "Objectifs épargne", labelEn: "Savings Goals", path: "/savings" },
  { icon: Users, label: "Mes Tontines", labelEn: "My Tontines", path: "/tontines" },
  { icon: TrendingUp, label: "Marketplace", labelEn: "Marketplace", path: "/marketplace" },
  { icon: Bell, label: "Notifications", labelEn: "Notifications", path: "/notifications" },
];

export function MemberLayout({ children, darkMode, onToggleDark, lang, onToggleLang }: MemberLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getLabel = (item: typeof navItems[0]) => lang === "fr" ? item.label : item.labelEn;

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          bg-sidebar`}
        style={{ borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 h-16 border-b border-sidebar-border">
          <PIJLogo variant="full" size="sm" theme="dark" />
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-1">
            <p className="px-3 py-1 text-xs uppercase tracking-widest text-sidebar-foreground/40 mb-1">
              {lang === "fr" ? "Menu principal" : "Main Menu"}
            </p>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150
                    ${active
                      ? "bg-[#4CAF68]/15 text-[#4CAF68] font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                >
                  <item.icon size={18} />
                  {getLabel(item)}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <User size={18} />
            {lang === "fr" ? "Profil" : "Profile"}
          </Link>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all w-full"
          >
            <LogOut size={18} />
            {lang === "fr" ? "Déconnexion" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen bg-background">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground/70 hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">
                {lang === "fr" ? "Bienvenue," : "Welcome,"}{" "}
                <span className="text-foreground font-medium">Amara Diallo</span>
              </p>
            </div>
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
            <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
