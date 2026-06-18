import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { MEMBERS } from "./mockData";

interface VerifyEmailProps {
  darkMode?: boolean;
  lang?: "fr" | "en";
}

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
              <div key={s} className="flex items-center gap-2">
                <CheckCircle size={14} color="#4CAF68" />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail({ darkMode, lang = "fr" }: VerifyEmailProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const member = MEMBERS.find((m) => m.id === "PIJ-2024-003");

  const handleCodeChange = (i: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    setError("");
    if (value && i < 5) {
      const nextInput = document.getElementById(`vc-${i + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const prev = document.getElementById(`vc-${i - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = () => {
    const entered = code.join("");
    if (entered === member?.verificationCode) {
      setVerified(true);
      setTimeout(() => navigate("/kyc"), 1500);
    } else {
      setError(fr ? "Code incorrect. Veuillez réessayer." : "Incorrect code. Please try again.");
    }
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => setResending(false), 1500);
  };

  return (
    <AuthCard darkMode={darkMode}>
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><PIJLogo variant="full" size="md" /></div>
        <button onClick={() => navigate("/register")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> {fr ? "Retour" : "Back"}
        </button>

        {!verified ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#F0E8FF] flex items-center justify-center mb-5">
              <Mail size={24} color="#6E3A9A" />
            </div>
            <h2 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
              {fr ? "Vérifiez votre email" : "Verify your email"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {fr
                ? "Nous avons envoyé un code à 6 chiffres à votre adresse email. Saisissez-le ci-dessous."
                : "We've sent a 6-digit code to your email address. Enter it below."}
            </p>

            <div className="flex gap-2 justify-center mb-6">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`vc-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-14 text-center text-lg font-bold rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3A9A]/40"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center mb-4">{error}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={code.join("").length !== 6}
              className="w-full py-3 rounded-xl text-white font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-all"
              style={{ background: code.join("").length === 6 ? "#4CAF68" : "#6B7280" }}
            >
              {fr ? "Vérifier" : "Verify"}
            </button>

            <div className="flex items-center justify-between mt-4">
              <button onClick={handleResend} disabled={resending} className="flex items-center gap-1.5 text-sm text-[#6E3A9A] hover:underline disabled:opacity-40">
                <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                {fr ? "Renvoyer le code" : "Resend code"}
              </button>
              <button onClick={() => navigate("/kyc")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {fr ? "Passer pour l'instant" : "Skip for now"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={24} color="#4CAF68" />
            </div>
            <h2 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
              {fr ? "Email vérifié !" : "Email verified!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {fr ? "Redirection vers la vérification KYC..." : "Redirecting to KYC verification..."}
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}
