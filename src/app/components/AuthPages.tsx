import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail, X, Check, Loader2 } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
  "throwaway.email", "yopmail.com", "trashmail.com", "sharklasers.com",
  "burnermail.io", "maildrop.cc", "getnada.com", "temp-mail.org",
]);

function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, reason: "format" };
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, reason: "disposable" };
  return { valid: true, reason: null };
}

interface PasswordCriterion {
  key: string;
  label: { fr: string; en: string };
  test: (pw: string) => boolean;
}

const PASSWORD_CRITERIA: PasswordCriterion[] = [
  { key: "upper", label: { fr: "1 lettre majuscule", en: "1 uppercase letter" }, test: (pw) => /[A-Z]/.test(pw) },
  { key: "lower", label: { fr: "1 lettre minuscule", en: "1 lowercase letter" }, test: (pw) => /[a-z]/.test(pw) },
  { key: "digit", label: { fr: "1 chiffre", en: "1 digit" }, test: (pw) => /\d/.test(pw) },
  { key: "special", label: { fr: "1 caractère spécial", en: "1 special character" }, test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  { key: "length", label: { fr: "8 caractères minimum", en: "At least 8 characters" }, test: (pw) => pw.length >= 8 },
];

function AuthCard({ children, darkMode }: { children: React.ReactNode; darkMode?: boolean }) {
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
            {["847 membres actifs", "7 tontines actives", "284M+ XAF en épargne"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <CheckCircle size={14} color="#4CAF68" />
                {s}
              </div>
            ))}
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
  const fr = lang === "fr";

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><PIJLogo variant="full" size="md" /></div>
        <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Se connecter" : "Log in"}</h2>
        <p className="text-sm text-muted-foreground mb-8">{fr ? "Accédez à votre espace membre PIJ." : "Access your PIJ member space."}</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input defaultValue="amara.diallo@email.com" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{fr ? "Mot de passe" : "Password"}</label>
            <div className="relative mt-1.5">
              <input type={showPw ? "text" : "password"} defaultValue="••••••••" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" />
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
          <button onClick={() => navigate("/dashboard")} className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2 hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
            {fr ? "Se connecter" : "Log in"}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {fr ? "Pas encore membre ?" : "Not a member yet?"}{" "}
          <button onClick={() => navigate("/register")} className="text-[#4CAF68] font-medium hover:underline">
            {fr ? "S'inscrire" : "Sign up"}
          </button>
        </p>
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          {fr ? "Accès admin ?" : "Admin access?"}{" "}
          <button onClick={() => navigate("/admin/dashboard")} className="text-[#6E3A9A] hover:underline">
            {fr ? "Portail Admin →" : "Admin Portal →"}
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
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState("");
  const fr = lang === "fr";

  const emailCheck = useMemo(() => {
    if (!email) return null;
    return validateEmail(email);
  }, [email]);

  const criteria = useMemo(() =>
    PASSWORD_CRITERIA.map((c) => ({ ...c, met: c.test(password) })),
    [password]
  );

  const allMet = criteria.every((c) => c.met);
  const emailValid = emailCheck?.valid === true;

  const handleSignUp = async () => {
    if (!allMet || !emailValid) return;
    setError("");
    setSigningUp(true);

    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    });

    if (signUpErr) {
      setSigningUp(false);
      setError(signUpErr.message);
      return;
    }

    const { data: sendData, error: sendErr } = await supabase.functions.invoke(
      "send-verification-code",
      { body: { email } },
    );

    setSigningUp(false);

    if (sendErr || !sendData?.success) {
      setError(sendData?.error || sendErr?.message || "Échec de l'envoi du code");
      return;
    }

    sessionStorage.setItem("pij_pending_email", email);
    sessionStorage.setItem("pij_pending_password", password);
    navigate("/verify-email", { state: { email } });
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{fr ? "Prénom" : "First name"}</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                placeholder="Amara"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{fr ? "Nom" : "Last name"}</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                placeholder="Diallo"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1.5">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10"
                placeholder="vous@email.com"
              />
              {emailCheck && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailCheck.valid ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                </span>
              )}
            </div>
            {emailCheck && !emailCheck.valid && (
              <p className="text-xs text-red-500 mt-1">
                {emailCheck.reason === "disposable"
                  ? (fr ? "Les emails jetables ne sont pas autorisés" : "Disposable emails are not allowed")
                  : (fr ? "Format d'email invalide" : "Invalid email format")}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Téléphone" : "Phone"}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
              placeholder="+237 6 XX XX XX XX"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Mot de passe" : "Password"}</label>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 mb-2">
              {criteria.map((c) => (
                <span
                  key={c.key}
                  className={`text-xs flex items-center gap-1 ${
                    password.length === 0
                      ? "text-muted-foreground"
                      : c.met
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {password.length === 0 ? (
                    <span className="w-3 h-3 rounded-full border border-muted-foreground" />
                  ) : c.met ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <X size={12} className="text-red-500" />
                  )}
                  {fr ? c.label.fr : c.label.en}
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10"
                placeholder="••••••••"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded border-border accent-[#4CAF68]" />
            <span>{fr ? "J'accepte les " : "I accept the "}<a href="#" className="text-[#6E3A9A] hover:underline">{fr ? "conditions d'utilisation" : "terms of use"}</a></span>
          </label>
          <button
            onClick={handleSignUp}
            disabled={!allMet || !emailValid || signingUp}
            className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: signingUp ? "#6B7280" : "#4CAF68" }}
          >
            {signingUp && <Loader2 size={16} className="animate-spin" />}
            {signingUp
              ? (fr ? "Création en cours..." : "Creating account...")
              : (fr ? "Créer mon compte" : "Create my account")}
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
  const [sent, setSent] = useState(false);
  const fr = lang === "fr";

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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
              </div>
              <button onClick={() => setSent(true)} className="w-full py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
                {fr ? "Envoyer le lien" : "Send reset link"}
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
