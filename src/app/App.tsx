import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LandingPage from "./components/LandingPage";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./components/AuthPages";
import KYCOnboarding from "./components/KYCOnboarding";
import { MemberLayout } from "./components/MemberLayout";
import MemberDashboard from "./components/MemberDashboard";
import TransactionHistory from "./components/TransactionHistory";
import SavingsGoals from "./components/SavingsGoals";
import TontineMarketplace from "./components/TontineMarketplace";
import MyTontines from "./components/MyTontines";
import TontineDetail from "./components/TontineDetail";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement";
import KYCReview from "./components/KYCReview";
import AccountManagement from "./components/AccountManagement";
import AdminTontines from "./components/AdminTontines";
import AdminTontineDetail from "./components/AdminTontineDetail";
import AdminTontineParticipants from "./components/AdminTontineParticipants";
import AdminTontineArchives from "./components/AdminTontineArchives";
import TontineArchiveDetail from "./components/TontineArchiveDetail";
import NotificationsPage from "./components/NotificationsPage";
import AdminReports from "./components/AdminReports";
import Formations from "./components/Formations";
import Investments from "./components/Investments";
import AdminFormations from "./components/AdminFormations";
import AdminInvestments from "./components/AdminInvestments";
import SystemMonitoring from "./components/SystemMonitoring";
import ProfilePage from "./components/ProfilePage";
import MemberSettings from "./components/MemberSettings";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  const toggleDark = () => setDarkMode((d) => !d);
  const toggleLang = () => setLang((l) => (l === "fr" ? "en" : "fr"));

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang} />} />
        <Route path="/login" element={<LoginPage darkMode={darkMode} lang={lang} />} />
        <Route path="/register" element={<RegisterPage darkMode={darkMode} lang={lang} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage darkMode={darkMode} lang={lang} />} />
        <Route path="/kyc" element={<KYCOnboarding darkMode={darkMode} lang={lang} />} />

        {/* Member portal */}
        <Route
          path="/dashboard"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <MemberDashboard lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <TransactionHistory lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/savings"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <SavingsGoals lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/formations"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Formations lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/formations/courses/:id"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Formations lang={lang} view="course" />
            </MemberLayout>
          }
        />
        <Route
          path="/formations/learning"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Formations lang={lang} view="learning" />
            </MemberLayout>
          }
        />
        <Route
          path="/formations/consultation"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Formations lang={lang} view="consultation" />
            </MemberLayout>
          }
        />
        <Route
          path="/investissements"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Investments lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/investissements/portfolio"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Investments lang={lang} view="portfolio" />
            </MemberLayout>
          }
        />
        <Route
          path="/investissements/wallet"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Investments lang={lang} view="wallet" />
            </MemberLayout>
          }
        />
        <Route
          path="/investissements/:id"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <Investments lang={lang} view="detail" />
            </MemberLayout>
          }
        />
        <Route
          path="/marketplace"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <TontineMarketplace lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/tontines"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <MyTontines lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/tontines/:id"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <TontineDetail lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/tontines/archives/:id"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <TontineArchiveDetail lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <NotificationsPage lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <ProfilePage lang={lang} />
            </MemberLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <MemberLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <MemberSettings lang={lang} darkMode={darkMode} onToggleDark={toggleDark} onToggleLang={toggleLang} />
            </MemberLayout>
          }
        />

        {/* Admin portal */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminDashboard lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <UserManagement lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <KYCReview lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AccountManagement lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tontines"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminTontines lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tontines/:id"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminTontineDetail lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tontines/:id/participants"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminTontineParticipants lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tontines/archives"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminTontineArchives lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/formations"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminFormations lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/investissements"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminInvestments lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminReports lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/system-audit"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <SystemMonitoring lang={lang} />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout darkMode={darkMode} onToggleDark={toggleDark} lang={lang} onToggleLang={toggleLang}>
              <AdminSettingsPlaceholder lang={lang} darkMode={darkMode} onToggleDark={toggleDark} onToggleLang={toggleLang} lang2={lang} />
            </AdminLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminSettingsPlaceholder({ lang, darkMode, onToggleDark, onToggleLang, lang2 }: { lang: string; darkMode: boolean; onToggleDark: () => void; onToggleLang: () => void; lang2: string }) {
  const fr = lang === "fr";
  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h2 className="mb-6" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Paramètres système" : "System settings"}</h2>
      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Apparence" : "Appearance"}</h3>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium">{fr ? "Mode sombre" : "Dark mode"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Basculer entre clair et sombre" : "Toggle between light and dark"}</p>
            </div>
            <button onClick={onToggleDark} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-[#4CAF68]" : "bg-muted"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{fr ? "Langue" : "Language"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Français / Anglais" : "French / English"}</p>
            </div>
            <button onClick={onToggleLang} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              {lang2 === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Plateforme" : "Platform"}</h3>
          <div className="space-y-3">
            {[
              { label: fr ? "Nom de la plateforme" : "Platform name", value: "PIJ Digital" },
              { label: fr ? "Email de contact" : "Contact email", value: "contact@pij.cm" },
              { label: fr ? "Devise par défaut" : "Default currency", value: "XAF (Franc CFA)" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <input defaultValue={f.value} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
            ))}
          </div>
          <button className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
            {fr ? "Sauvegarder" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
