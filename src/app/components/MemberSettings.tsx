import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sun, Moon, Globe, Bell, Shield, Eye, Download, Trash2,
  ChevronRight, Smartphone, Monitor, LogOut, ArrowLeft
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getCurrentUserId } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";

export default function MemberSettings() {
  const { lang, darkMode, toggleDark, toggleLang, userProfile } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [visibility, setVisibility] = useState<"public" | "members" | "private">("members");
  const [twoFactor, setTwoFactor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sessions: { device: string; ip: string; current: boolean; time: string }[] = [
    { device: navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("Safari") ? "Safari Browser" : "Chrome Browser", ip: "", current: true, time: new Date().toLocaleString() },
  ];

  const handleLogoutAllDevices = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to logout all devices:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = await getCurrentUserId();
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      await supabase.from("users").delete().eq("id", userId);
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const userId = await getCurrentUserId();
      const [profiles, goals, txns, tontines, consultations] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).single(),
        supabase.from("savings_goals").select("*").eq("user_id", userId),
        supabase.from("transactions").select("*").eq("user_id", userId),
        supabase.from("tontine_members").select("*, tontines(*)").eq("user_id", userId),
        supabase.from("consultation_requests").select("*").eq("user_id", userId),
      ]);

      const exportData = {
        profile: profiles.data,
        savings_goals: goals.data,
        transactions: txns.data,
        tontines: tontines.data,
        consultations: consultations.data,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pij-export-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export data:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
            {fr ? "Paramètres" : "Settings"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Personnalisez votre expérience" : "Customize your experience"}
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            {darkMode ? <Moon size={18} style={{ color: "#4CAF68" }} /> : <Sun size={18} style={{ color: "#4CAF68" }} />}
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Apparence" : "Appearance"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Thème et langue" : "Theme and language"}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm">{fr ? "Mode sombre" : "Dark mode"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Basculer entre clair et sombre" : "Toggle light and dark"}</p>
            </div>
            <ToggleSwitch checked={darkMode} onChange={toggleDark} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm">{fr ? "Langue" : "Language"}</p>
                <p className="text-xs text-muted-foreground">{fr ? "Français / Anglais" : "French / English"}</p>
              </div>
            </div>
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors min-h-[36px]"
            >
              {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            <Bell size={18} style={{ color: "#4CAF68" }} />
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Notifications" : "Notifications"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Préférences de notification" : "Notification preferences"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm">Email</span>
            </div>
            <ToggleSwitch checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm">SMS</span>
            </div>
            <ToggleSwitch checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm">Push</span>
            </div>
            <ToggleSwitch checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            <Eye size={18} style={{ color: "#4CAF68" }} />
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Confidentialité" : "Privacy"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Visibilité du profil" : "Profile visibility"}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { value: "public", fr: "Public", en: "Public", desc: fr ? "Visible par tout le monde" : "Visible to everyone" },
            { value: "members", fr: "Membres uniquement", en: "Members only", desc: fr ? "Visible par les membres PIJ" : "Visible to PIJ members only" },
            { value: "private", fr: "Privé", en: "Private", desc: fr ? "Visible par personne" : "Visible to no one" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value as typeof visibility)}
                className="w-4 h-4 accent-[#4CAF68]"
              />
              <div>
                <p className="text-sm font-medium">{fr ? opt.fr : opt.en}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            <Shield size={18} style={{ color: "#4CAF68" }} />
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Sécurité" : "Security"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Authentification et sessions" : "Authentication and sessions"}</p>
          </div>
        </div>

        {/* 2FA */}
        <div className="flex items-center justify-between py-2 mb-4">
          <div>
            <p className="text-sm">{fr ? "Authentification à deux facteurs" : "Two-factor authentication"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Sécurisez votre compte" : "Secure your account"}</p>
          </div>
          <ToggleSwitch checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
        </div>

        {/* Active sessions */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {fr ? "Sessions actives" : "Active sessions"}
          </p>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {s.device.includes("iPhone") || s.device.includes("Safari")
                    ? <Smartphone size={16} className="text-muted-foreground shrink-0" />
                    : <Monitor size={16} className="text-muted-foreground shrink-0" />
                  }
                  <div>
                    <p className="text-sm">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.ip} · {s.time}</p>
                  </div>
                </div>
                {s.current ? (
                  <span className="text-xs text-[#4CAF68] font-medium">{fr ? "Actuelle" : "Current"}</span>
                ) : (
                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    {fr ? "Déconnecter" : "Log out"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleLogoutAllDevices} className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={14} />
            {fr ? "Déconnecter tous les appareils" : "Log out all devices"}
          </button>
        </div>
      </div>

      {/* Data & Account */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            <Download size={18} style={{ color: "#4CAF68" }} />
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Données et compte" : "Data & Account"}</p>
            <p className="text-xs text-muted-foreground">{fr ? "Exportez ou supprimez vos données" : "Export or delete your data"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={handleExportData} disabled={exporting} className="w-full flex items-center justify-between py-3 px-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50">
            <div>
              <p className="text-sm font-medium">{exporting ? (fr ? "Export en cours..." : "Exporting...") : (fr ? "Exporter mes données" : "Export my data")}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Téléchargez une copie de vos informations" : "Download a copy of your information"}</p>
            </div>
            <Download size={16} className="text-muted-foreground shrink-0" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-red-500">{fr ? "Supprimer mon compte" : "Delete my account"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Cette action est irréversible" : "This action is irreversible"}</p>
            </div>
            <Trash2 size={16} className="text-red-400 shrink-0" />
          </button>
          {showDeleteConfirm && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {fr
                  ? "Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront perdues."
                  : "Are you sure you want to delete your account? All your data will be lost."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={handleDeleteAccount} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors min-h-[44px]">
                  {fr ? "Oui, supprimer" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors min-h-[44px]"
                >
                  {fr ? "Annuler" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-[#4CAF68]" : "bg-muted"}`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}
