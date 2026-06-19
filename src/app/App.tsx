import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./components/AuthPages";
import KYCOnboarding from "./components/KYCOnboarding";
import VerifyEmail from "./components/VerifyEmail";
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
import AdminTontineTypes from "./components/AdminTontineTypes";
import TontineArchiveDetail from "./components/TontineArchiveDetail";
import NotificationsPage from "./components/NotificationsPage";
import AdminReports from "./components/AdminReports";
import AdminProfile from "./components/AdminProfile";
import AdminNotifications from "./components/AdminNotifications";
import AdminAdministrators from "./components/AdminAdministrators";
import AdminInviteAccept from "./components/AdminInviteAccept";
import SuperAdminRoute from "./components/SuperAdminRoute";
import Formations from "./components/Formations";
import Investments from "./components/Investments";
import AdminFormations from "./components/AdminFormations";
import AdminInvestments from "./components/AdminInvestments";
import SystemMonitoring from "./components/SystemMonitoring";
import ProfilePage from "./components/ProfilePage";
import MemberSettings from "./components/MemberSettings";
import { useAppContext } from "./context/AppContext";

function AdminSettingsPlaceholder() {
  const { darkMode, toggleDark, toggleLang, lang } = useAppContext();
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
            <button onClick={toggleDark} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-[#4CAF68]" : "bg-muted"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{fr ? "Langue" : "Language"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Français / Anglais" : "French / English"}</p>
            </div>
            <button onClick={toggleLang} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin/invite/:token" element={<AdminInviteAccept />} />
          <Route path="/kyc" element={<KYCOnboarding />} />

          {/* Member portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <MemberDashboard />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <TransactionHistory />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <SavingsGoals />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Formations />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/courses/:id"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Formations view="course" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/learning"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Formations view="learning" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/consultation"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Formations view="consultation" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Investments />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/portfolio"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Investments view="portfolio" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/wallet"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Investments view="wallet" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/:id"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <Investments view="detail" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <TontineMarketplace />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <MyTontines />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines/:id"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <TontineDetail />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines/archives/:id"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <TontineArchiveDetail />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <NotificationsPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <ProfilePage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute type="member">
                <MemberLayout>
                  <MemberSettings />
                </MemberLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin portal */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <KYCReview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AccountManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminTontines />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/:id"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminTontineDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/:id/participants"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminTontineParticipants />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontine-types"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminTontineTypes />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/archives"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminTontineArchives />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/formations"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminFormations />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investissements"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminInvestments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <SuperAdminRoute>
                    <AdminAdministrators />
                  </SuperAdminRoute>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminNotifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <AdminProfile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system-audit"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <SuperAdminRoute>
                    <SystemMonitoring />
                  </SuperAdminRoute>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute type="admin">
                <AdminLayout>
                  <SuperAdminRoute>
                    <AdminSettingsPlaceholder />
                  </SuperAdminRoute>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
