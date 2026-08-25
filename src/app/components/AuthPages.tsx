import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail, X, Check, Loader2 } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { isPhoneRegistered } from "../lib/supabase/queries";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
  "throwaway.email", "yopmail.com", "trashmail.com", "sharklasers.com",
  "burnermail.io", "maildrop.cc", "getnada.com", "temp-mail.org",
]);

// Supabase's gateway returns a plain-text (non-JSON) body for gateway-level
// failures like an invalid/rotated API key, which the client then fails to
// parse — surfacing a raw "Unexpected token ... is not valid JSON" message
// instead of a real auth error. Catch that (and plain network failures) and
// show something a member can actually act on.
function friendlyAuthError(message: string, fr: boolean): string {
  const isGatewayOrNetworkFailure =
    /is not valid JSON|Invalid API key|Failed to fetch|NetworkError|Load failed|^\{\}$/i.test(message.trim());
  if (isGatewayOrNetworkFailure) {
    return fr
      ? "Impossible de contacter nos serveurs pour le moment. Veuillez réessayer dans un instant."
      : "We couldn't reach our servers right now. Please try again in a moment.";
  }
  return message;
}

function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, reason: "format" };
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, reason: "disposable" };
  return { valid: true, reason: null };
}

// Existing phone data in the DB is stored as a bare 9-digit local number
// (no +237, no spaces) -- normalize whatever format the member types
// (+237 6XX XXX XXX, 237690123456, 06 90 12 34 56, ...) to that same
// shape so validation, the duplicate check, and storage all agree.
function normalizeCameroonPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("237")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function validateCameroonPhone(raw: string) {
  const normalized = normalizeCameroonPhone(raw);
  const valid = /^6\d{8}$/.test(normalized);
  return { valid, normalized };
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fr = lang === "fr";

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError(fr ? "Veuillez renseigner votre email et mot de passe." : "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setLoading(false);
      setError(friendlyAuthError(signInErr.message, fr));
      return;
    }

    // Route by role right away instead of waiting on AppContext's async
    // profile fetch to catch up. A formateur is a regular member with one
    // extra permission, not an admin -- they land in the same member
    // dashboard as everyone else, plus a "Mes Formations" sidebar entry.
    const { data: role } = await supabase.rpc("current_admin_role");
    setLoading(false);
    if (role === "admin" || role === "super_admin") navigate("/admin/dashboard");
    else navigate("/dashboard");
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><PIJLogo variant="full" size="md" /></div>
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> {fr ? "Retour" : "Back"}
        </button>
        <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Se connecter" : "Log in"}</h2>
        <p className="text-sm text-muted-foreground mb-8">{fr ? "Accédez à votre espace membre PIJ." : "Access your PIJ member space."}</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
              placeholder="vous@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{fr ? "Mot de passe" : "Password"}</label>
            <div className="relative mt-1.5">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10"
              />
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
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2 hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ background: "#4CAF68" }}
          >
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const fr = lang === "fr";

  const emailCheck = useMemo(() => {
    if (!email) return null;
    return validateEmail(email);
  }, [email]);

  const phoneCheck = useMemo(() => {
    if (!phone) return null;
    return validateCameroonPhone(phone);
  }, [phone]);

  const criteria = useMemo(() =>
    PASSWORD_CRITERIA.map((c) => ({ ...c, met: c.test(password) })),
    [password]
  );

  const allMet = criteria.every((c) => c.met);
  const emailValid = emailCheck?.valid === true;
  const phoneValid = phoneCheck?.valid === true;
  const canSubmit = allMet && emailValid && phoneValid && !!firstName && !!lastName && acceptedTerms && !signingUp;

  const handleRegister = async () => {
    setError("");
    // Surface exactly what's missing instead of silently doing nothing.
    if (!firstName || !lastName) {
      setError(fr ? "Veuillez renseigner votre prénom et votre nom." : "Please enter your first and last name.");
      return;
    }
    if (!emailValid) {
      setError(fr ? "Veuillez saisir une adresse email valide." : "Please enter a valid email address.");
      return;
    }
    if (!phoneValid) {
      setError(fr
        ? "Veuillez saisir un numéro de téléphone camerounais valide (ex: +237 6XX XXX XXX)."
        : "Please enter a valid Cameroon phone number (e.g. +237 6XX XXX XXX).");
      return;
    }
    if (!allMet) {
      setError(fr ? "Votre mot de passe ne respecte pas tous les critères requis." : "Your password does not meet all the required criteria.");
      return;
    }
    if (!acceptedTerms) {
      setError(fr ? "Veuillez accepter les conditions d'utilisation." : "Please accept the terms of use.");
      return;
    }
    if (signingUp) return;
    setSigningUp(true);

    const normalizedPhone = phoneCheck!.normalized;
    try {
      if (await isPhoneRegistered(normalizedPhone)) {
        setError(fr ? "Ce numéro de téléphone est déjà enregistré." : "This phone number is already registered.");
        setSigningUp(false);
        return;
      }
    } catch {
      // Availability check itself failing shouldn't block signup -- the DB's
      // unique constraint still enforces this as a last resort.
    }

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone: normalizedPhone },
        emailRedirectTo: `${window.location.origin}/kyc`,
      },
    });

    setSigningUp(false);
    if (signUpErr) {
      setError(friendlyAuthError(signUpErr.message, fr));
      return;
    }

    // With "Confirm email" on, signUp() creates the account but returns no
    // session until the member clicks the confirmation link — show them
    // that screen instead of navigating in. If confirmation is off (or this
    // account was pre-confirmed some other way), a session comes back
    // immediately and we can skip straight to KYC.
    if (data.session) {
      navigate("/kyc");
      return;
    }
    setConfirmationSent(true);
  };

  const handleResendConfirmation = async () => {
    if (!email || resending) return;
    setResending(true);
    setError("");
    const { error: resendErr } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (resendErr) setError(friendlyAuthError(resendErr.message, fr));
  };

  if (confirmationSent) {
    return (
      <AuthCard darkMode={darkMode}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
            <Mail size={24} color="#4CAF68" />
          </div>
          <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Vérifiez votre email" : "Check your email"}</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {fr
              ? "Nous avons envoyé un lien de confirmation à :"
              : "We've sent a confirmation link to:"}
          </p>
          <p className="text-sm font-medium mb-6">{email}</p>
          <p className="text-xs text-muted-foreground mb-6">
            {fr
              ? "Cliquez sur le lien pour activer votre compte, puis connectez-vous."
              : "Click the link to activate your account, then log in."}
          </p>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          <button onClick={handleResendConfirmation} disabled={resending} className="text-sm text-[#4CAF68] font-medium hover:underline disabled:opacity-50">
            {resending ? (fr ? "Envoi..." : "Sending...") : (fr ? "Renvoyer l'email" : "Resend email")}
          </button>
          <p className="text-center text-sm text-muted-foreground mt-6">
            <button onClick={() => navigate("/login")} className="text-[#6E3A9A] font-medium hover:underline">
              {fr ? "Retour à la connexion" : "Back to login"}
            </button>
          </p>
        </div>
      </AuthCard>
    );
  }

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
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}

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
            <div className="relative mt-1.5">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10"
                placeholder="+237 6 XX XX XX XX"
              />
              {phoneCheck && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {phoneCheck.valid ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                </span>
              )}
            </div>
            {phoneCheck && !phoneCheck.valid && (
              <p className="text-xs text-red-500 mt-1">
                {fr ? "Format invalide (ex: +237 6XX XXX XXX)" : "Invalid format (e.g. +237 6XX XXX XXX)"}
              </p>
            )}
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
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 rounded border-border accent-[#4CAF68]" />
            <span>{fr ? "J'accepte les " : "I accept the "}<a href="#" className="text-[#6E3A9A] hover:underline">{fr ? "conditions d'utilisation" : "terms of use"}</a></span>
          </label>
          <button
            onClick={handleRegister}
            disabled={signingUp}
            aria-disabled={!canSubmit}
            className={`w-full py-3 rounded-xl text-white font-medium text-sm mt-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${canSubmit ? "hover:opacity-90" : "opacity-60"}`}
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
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fr = lang === "fr";

  const handleSend = async () => {
    setError("");
    if (!email) {
      setError(fr ? "Veuillez renseigner votre email." : "Please enter your email.");
      return;
    }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetErr) {
      setError(friendlyAuthError(resetErr.message, fr));
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
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="vous@email.com" />
              </div>
              <button onClick={handleSend} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: "#4CAF68" }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
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

export function ResetPasswordPage() {
  const { darkMode, lang } = useAppContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fr = lang === "fr";

  const criteriaMet = useMemo(() => PASSWORD_CRITERIA.every((c) => c.test(password)), [password]);

  const handleReset = async () => {
    setError("");
    if (!criteriaMet) {
      setError(fr ? "Le mot de passe ne respecte pas les critères requis." : "Password does not meet the required criteria.");
      return;
    }
    if (password !== confirmPassword) {
      setError(fr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateErr) {
      setError(friendlyAuthError(updateErr.message, fr));
      return;
    }
    setDone(true);
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        {!done ? (
          <>
            <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Réinitialiser le mot de passe" : "Reset password"}</h2>
            <p className="text-sm text-muted-foreground mb-8">{fr ? "Choisissez un nouveau mot de passe pour votre compte." : "Choose a new password for your account."}</p>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{fr ? "Nouveau mot de passe" : "New password"}</label>
                <div className="relative mt-1.5">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {PASSWORD_CRITERIA.map((c) => (
                    <div key={c.key} className="flex items-center gap-1.5 text-xs">
                      {c.test(password) ? <Check size={12} color="#4CAF68" /> : <X size={12} className="text-muted-foreground" />}
                      <span className={c.test(password) ? "text-[#4CAF68]" : "text-muted-foreground"}>{fr ? c.label.fr : c.label.en}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Confirmer le mot de passe" : "Confirm password"}</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
                />
              </div>
              <button onClick={handleReset} disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: "#4CAF68" }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {fr ? "Réinitialiser" : "Reset password"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={24} color="#4CAF68" />
            </div>
            <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Mot de passe mis à jour !" : "Password updated!"}</h2>
            <p className="text-sm text-muted-foreground mb-6">{fr ? "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe." : "You can now sign in with your new password."}</p>
            <button onClick={() => navigate("/login")} className="text-sm text-[#4CAF68] font-medium hover:underline">
              {fr ? "Retour à la connexion" : "Back to login"}
            </button>
          </div>
        )}
      </div>
    </AuthCard>
  );
}
