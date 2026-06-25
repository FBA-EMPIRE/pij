import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { fetchDashboardStats } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

function AuthCard({ children, darkMode }: { children: React.ReactNode; darkMode?: boolean }) {
  const [stats, setStats] = useState({ memberCount: 0, tontineCount: 0, totalSavings: 0 });
  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
  }, []);
  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-1">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-96 p-10 text-white" style={{ background: "linear-gradient(160deg, #1E2530 0%, #2A3444 60%, #1F3A2D 100%)" }}>
          <PIJLogo variant="full" size="md" theme="dark" />
          <div>
            <p className="text-2xl font-bold leading-snug mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              "Investir aujourd'hui pour construire l'avenir"
            </p>
            <p className="text-white/60 text-sm">Programme d'Investissement des Jeunes — Afrique Centrale</p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} color="#4CAF68" />
              {stats.memberCount.toLocaleString()} {stats.memberCount > 1 ? "membres actifs" : "membre actif"}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} color="#4CAF68" />
              {stats.tontineCount.toLocaleString()} {stats.tontineCount > 1 ? "tontines actives" : "tontine active"}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} color="#4CAF68" />
              {formatXAF(stats.totalSavings)} XAF en épargne
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { darkMode, lang } = useAppContext();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fr = lang === "fr";

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError(fr ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
      return;
    }
    if (!supabase) {
      setError(fr ? "Erreur de connexion au serveur." : "Server connection error.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><PIJLogo variant="full" size="md" /></div>
        <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Se connecter" : "Log in"}</h2>
        <p className="text-sm text-muted-foreground mb-8">{fr ? "Accédez à votre espace membre PIJ." : "Access your PIJ member space."}</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{fr ? "Mot de passe" : "Password"}</label>
            <div className="relative mt-1.5">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded border-border accent-[#4CAF68]" />
              {fr ? "Se souvenir de moi" : "Remember me"}
            </label>
            <button onClick={() => navigate("/forgot-password")} className="text-sm text-[#6E3A9A] hover:underline">
              {fr ? "Mot de passe oublié ?" : "Forgot password?"}
            </button>
          </div>
          <button onClick={handleLogin} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2 hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: "#4CAF68" }}>
            {loading ? (fr ? "Connexion..." : "Logging in...") : (fr ? "Se connecter" : "Log in")}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {fr ? "Pas encore membre ?" : "Not a member yet?"}{" "}
          <button onClick={() => navigate("/register")} className="text-[#4CAF68] font-medium hover:underline">
            {fr ? "S'inscrire" : "Sign up"}
          </button>
        </p>
      </div>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { darkMode, lang } = useAppContext();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fr = lang === "fr";

  const handleSignUp = async () => {
    setError("");
    if (!email || !password || !firstName || !lastName) {
      setError(fr ? "Veuillez remplir tous les champs obligatoires." : "Please fill in all required fields.");
      return;
    }
    if (!supabase) {
      setError(fr ? "Erreur de connexion au serveur." : "Server connection error.");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    navigate("/verify-email");
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><PIJLogo variant="full" size="md" /></div>
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> {fr ? "Retour" : "Back"}
        </button>
        <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Créer un compte" : "Create account"}</h2>
        <p className="text-sm text-muted-foreground mb-8">{fr ? "Rejoignez la communauté PIJ dès aujourd'hui." : "Join the PIJ community today."}</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{fr ? "Prénom" : "First name"}</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="Amara" />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Nom" : "Last name"}</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="Diallo" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Téléphone" : "Phone"}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="+237 6 XX XX XX XX" />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Mot de passe" : "Password"}</label>
            <div className="relative mt-1.5">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" placeholder="••••••••" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded border-border accent-[#4CAF68]" />
            <span>{fr ? "J'accepte les " : "I accept the "}<a href="#" className="text-[#6E3A9A] hover:underline">{fr ? "conditions d'utilisation" : "terms of use"}</a></span>
          </label>
          <button onClick={handleSignUp} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2 hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: "#4CAF68" }}>
            {loading ? (fr ? "Inscription..." : "Signing up...") : (fr ? "Créer mon compte" : "Create my account")}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {fr ? "Déjà membre ?" : "Already a member?"}{" "}
          <button onClick={() => navigate("/login")} className="text-[#4CAF68] font-medium hover:underline">
            {fr ? "Se connecter" : "Log in"}
          </button>
        </p>
      </div>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const { darkMode, lang } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fr = lang === "fr";

  const handleReset = async () => {
    setError("");
    if (!email) {
      setError(fr ? "Veuillez entrer votre email." : "Please enter your email.");
      return;
    }
    if (!supabase) {
      setError(fr ? "Erreur de connexion au serveur." : "Server connection error.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <button onClick={() => navigate("/login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> {fr ? "Retour" : "Back"}
        </button>
        {!sent ? (
          <>
            <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Mot de passe oublié" : "Forgot password"}</h2>
            <p className="text-sm text-muted-foreground mb-8">{fr ? "Entrez votre email. Nous vous enverrons un lien de réinitialisation." : "Enter your email. We'll send you a reset link."}</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
              </div>
              <button onClick={handleReset} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: "#4CAF68" }}>
                {loading ? (fr ? "Envoi..." : "Sending...") : (fr ? "Envoyer le lien" : "Send reset link")}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <Mail size={24} color="#4CAF68" />
            </div>
            <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Email envoyé !" : "Email sent!"}</h2>
            <p className="text-sm text-muted-foreground mb-6">{fr ? "Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation." : "Check your inbox and click the reset link."}</p>
            <button onClick={() => navigate("/login")} className="text-sm text-[#4CAF68] font-medium hover:underline">
              {fr ? "Retour à la connexion" : "Back to login"}
            </button>
          </div>
        )}
      </div>
    </AuthCard>
  );
}
