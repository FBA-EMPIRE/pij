import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from "./components/AuthPages";
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
import SuperAdminDashboard from "./components/SuperAdminDashboard";
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
import RoleGuard from "./components/RoleGuard";
import Formations from "./components/Formations";
import Investments from "./components/Investments";
import Loans from "./components/Loans";
import FormationsDashboard from "./components/FormationsDashboard";
import FormationDetail from "./components/FormationDetail";
import AdminInvestments from "./components/AdminInvestments";
import AdminLoans from "./components/AdminLoans";
import SystemMonitoring from "./components/SystemMonitoring";
import ProfilePage from "./components/ProfilePage";
import MemberSettings from "./components/MemberSettings";
import AuditLogs from "./components/AuditLogs";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import { useAppContext } from "./context/AppContext";

function AdminSettingsPlaceholder() {
  const navigate = useNavigate();
  const { darkMode, toggleDark, toggleLang, lang } = useAppContext();
  const fr = lang === "fr";
  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
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
      </div>
    </div>
  );
}

function RoleDashboard() {
  const { userProfile } = useAppContext();
  if (userProfile?.role === "super_admin") return <SuperAdminDashboard />;
  return <AdminDashboard />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <AppProvider>
      <Toaster richColors position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/invite/:token" element={<AdminInviteAccept />} />
          <Route path="/kyc" element={<KYCOnboarding />} />

          {/* Member portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <MemberDashboard />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <TransactionHistory />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <SavingsGoals />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Formations />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/courses/:id"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Formations view="course" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/learning"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Formations view="learning" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations/consultation"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Formations view="consultation" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Investments />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/portfolio"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Investments view="portfolio" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/wallet"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Investments view="wallet" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investissements/:id"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Investments view="detail" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Loans />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/:id"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <Loans view="detail" />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <TontineMarketplace />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <MyTontines />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines/:id"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <TontineDetail />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tontines/archives/:id"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <TontineArchiveDetail />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <NotificationsPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <ProfilePage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute >
                <MemberLayout>
                  <MemberSettings />
                </MemberLayout>
              </ProtectedRoute>
            }
          />

          {/* Trainer workspace -- a formateur is a regular member with one
              extra permission, so this renders inside MemberLayout (same
              sidebar as everyone else) rather than the admin portal.
              Admins can also reach it directly; regular members can't. */}
          <Route
            path="/trainer/formations"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["formateur", "admin", "super_admin"]}>
                  <MemberLayout>
                    <FormationsDashboard />
                  </MemberLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/formations/:id"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["formateur", "admin", "super_admin"]}>
                  <MemberLayout>
                    <FormationDetail />
                  </MemberLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Admin portal -- admins/super_admins only; every route below is
              wrapped in RoleGuard so a formateur or regular member hitting
              one of these URLs directly gets bounced, not just hidden from
              the nav. */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <RoleDashboard />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <KYCReview />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AccountManagement />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminTontines />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/:id"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminTontineDetail />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/:id/participants"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminTontineParticipants />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontine-types"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminTontineTypes />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tontines/archives"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminTontineArchives />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/formations"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <FormationsDashboard />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/formations/:id"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <FormationDetail />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investissements"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminInvestments />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/loans"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminLoans />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminReports />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <SuperAdminRoute>
                      <AdminAdministrators />
                    </SuperAdminRoute>
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <SuperAdminRoute>
                      <AuditLogs />
                    </SuperAdminRoute>
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminNotifications />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <AdminProfile />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <SuperAdminRoute>
                      <SystemMonitoring />
                    </SuperAdminRoute>
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute >
                <RoleGuard allow={["admin", "super_admin"]}>
                  <AdminLayout>
                    <SuperAdminRoute>
                      <AdminSettingsPlaceholder />
                    </SuperAdminRoute>
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
    </ErrorBoundary>
  );
}
