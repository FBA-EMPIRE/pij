import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Eye, EyeOff, CheckCircle, Shield, XCircle } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { ADMIN_INVITATIONS, ADMINS } from "./mockData";
import { useAppContext } from "../context/AppContext";

function AuthCard({ children, darkMode }: { children: React.ReactNode; darkMode?: boolean }) {
  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-1">
        <div className="hidden lg:flex flex-col justify-between w-96 p-10 text-white" style={{ background: "linear-gradient(160deg, #1E2530 0%, #2A3444 60%, #1F3A2D 100%)" }}>
          <PIJLogo variant="full" size="md" theme="dark" />
          <div>
            <p className="text-2xl font-bold leading-snug mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              "Investir aujourd'hui pour construire l'avenir"
            </p>
            <p className="text-white/60 text-sm">Programme d'Investissement des Jeunes — Afrique Centrale</p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            {["847 membres actifs", "7 tontines actives", "284M+ XAF en épargne"].map((s) => (
              <div key={s} className="flex items-center gap-2"><CheckCircle size={14} color="#4CAF68" />{s}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-background">{children}</div>
      </div>
    </div>
  );
}

export default function AdminInviteAccept() {
  const { darkMode, lang } = useAppContext();
  const { token } = useParams();
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const invitation = ADMIN_INVITATIONS.find((i) => i.token === token);

  if (!invitation || invitation.status !== "Pending") {
    return (
      <AuthCard darkMode={darkMode}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle size={24} color="#E5484D" />
          </div>
          <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
            {fr ? "Lien invalide" : "Invalid link"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {fr
              ? "Ce lien d'invitation est invalide ou a expiré."
              : "This invitation link is invalid or has expired."}
          </p>
          <button onClick={() => navigate("/admin/dashboard")} className="text-sm text-[#4CAF68] font-medium hover:underline">
            {fr ? "Aller au portail admin" : "Go to admin portal"}
          </button>
        </div>
      </AuthCard>
    );
  }

  const handleActivate = () => {
    if (password.length < 6) {
      setError(fr ? "Le mot de passe doit contenir au moins 6 caractères." : "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError(fr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }
    setError("");

    ADMINS.push({
      id: `ADM-${String(ADMINS.length + 1).padStart(3, "0")}`,
      initials: invitation.email.split("@")[0].slice(0, 2).toUpperCase(),
      initialsColor: "#4CAF68",
      name: invitation.email.split("@")[0],
      email: invitation.email,
      phone: "",
      role: invitation.role,
      lastLogin: "",
      lastLoginFr: "",
      status: "Active",
      created: new Date().toISOString().slice(0, 10),
    });

    invitation.status = "Accepted";
    setAccepted(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (accepted) {
    return (
      <AuthCard darkMode={darkMode}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={24} color="#4CAF68" />
          </div>
          <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
            {fr ? "Compte activé !" : "Account activated!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {fr ? "Redirection vers la connexion..." : "Redirecting to login..."}
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} color="#4CAF68" />
          <span className="text-sm font-medium text-muted-foreground">
            {fr ? "Invitation administrateur" : "Admin invitation"}
          </span>
        </div>
        <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
          {fr ? "Bienvenue sur PIJ" : "Welcome to PIJ"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {fr ? "Créez votre mot de passe pour activer votre compte." : "Set your password to activate your account."}
        </p>

        <div className="bg-[#F0E8FF] rounded-xl p-3 mb-6">
          <p className="text-xs text-[#6E3A9A] font-medium">{invitation.email}</p>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-[#6E3A9A]">
            {invitation.role === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{fr ? "Mot de passe" : "Password"}</label>
            <div className="relative mt-1.5">
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Confirmer le mot de passe" : "Confirm password"}</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleActivate} disabled={!password || !confirm}
            className="w-full py-3 rounded-xl text-white font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-all"
            style={{ background: "#4CAF68" }}>
            {fr ? "Activer le compte" : "Activate Account"}
          </button>
        </div>
      </div>
    </AuthCard>
  );
}
