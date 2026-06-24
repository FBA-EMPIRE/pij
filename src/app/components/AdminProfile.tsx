import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, Shield, CalendarDays, Clock } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getCurrentUserId, fetchAdmins } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";

export default function AdminProfile() {
  const { darkMode, toggleDark, toggleLang, lang } = useAppContext();
  const fr = lang === "fr";
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        const allAdmins = await fetchAdmins();
        const current = allAdmins.find((a: any) => a.id === userId) ?? allAdmins[0] ?? null;
        setAdmin(current);
        if (current) {
          setName([current.first_name, current.last_name].filter(Boolean).join(" "));
          setEmail(current.email ?? "");
          setPhone(current.phone ?? "");
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const roleLabel = admin?.roles?.name === "super_admin"
    ? (fr ? "Super Administrateur" : "Super Admin")
    : (fr ? "Administrateur" : "Admin");

  const handleSave = async () => {
    if (!admin) return;
    await supabase.from("admins").update({ first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" "), email, phone }).eq("id", admin.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Profil Administrateur" : "Admin Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Gérez vos informations personnelles et vos préférences." : "Manage your personal information and preferences."}
          </p>
        </div>
        {saved && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#E8F5EC] text-[#1F9D55] font-medium">
            {fr ? "Enregistré" : "Saved"}
          </span>
        )}
      </div>

      {/* Personal Info */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ background: "#6E3A9A" }}>
            {(admin ? [admin.first_name, admin.last_name].filter(Boolean).map((s: string) => s[0]).join("").slice(0, 2).toUpperCase() : "?")}
          </div>
          <div>
            <p className="text-base font-semibold">{name || email}</p>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#E8F5EC] text-[#1F9D55]">{roleLabel}</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {fr ? "Informations personnelles" : "Personal Information"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{fr ? "Nom complet" : "Full name"}</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Téléphone" : "Phone"}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>
          <button onClick={handleSave}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
            <Save size={15} />
            {fr ? "Enregistrer" : "Save"}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} color="#6E3A9A" />
          <h3 className="text-sm font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Sécurité" : "Security"}
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{fr ? "Mot de passe actuel" : "Current password"}</label>
            <div className="relative mt-1.5">
              <input type={showCurrent ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Nouveau mot de passe" : "New password"}</label>
            <div className="relative mt-1.5">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{fr ? "Confirmer le mot de passe" : "Confirm password"}</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>
          <button
            disabled={!currentPw || !newPw || !confirmPw || newPw !== confirmPw}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all"
            style={{ background: "#6E3A9A" }}
          >
            {fr ? "Mettre à jour le mot de passe" : "Update password"}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-5">
        <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {fr ? "Préférences" : "Preferences"}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{fr ? "Langue" : "Language"}</p>
              <p className="text-xs text-muted-foreground">{fr ? "Français / Anglais" : "French / English"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={toggleLang} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
              </button>
            </div>
          </div>
          {true && (
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium">{fr ? "Mode sombre" : "Dark mode"}</p>
                <p className="text-xs text-muted-foreground">{fr ? "Basculer entre clair et sombre" : "Toggle between light and dark"}</p>
              </div>
              <button onClick={toggleDark} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-[#4CAF68]" : "bg-muted"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "left-6" : "left-1"}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {fr ? "Informations du compte" : "Account Information"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield size={11} /> {fr ? "Rôle" : "Role"}</p>
            <p className="text-sm font-semibold mt-0.5">{roleLabel}</p>
          </div>
          <div className="p-3 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays size={11} /> {fr ? "Créé le" : "Created"}</p>
            <p className="text-sm font-semibold mt-0.5">{admin?.created_at?.slice(0, 10) ?? "-"}</p>
          </div>
          <div className="p-3 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} /> {fr ? "Dernière connexion" : "Last login"}</p>
            <p className="text-sm font-semibold mt-0.5">{admin?.last_login_at ? new Date(admin.last_login_at).toLocaleString(fr ? "fr-FR" : "en-US") : (fr ? "Jamais" : "Never")}</p>
          </div>
          <div className="p-3 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground">{fr ? "Statut" : "Status"}</p>
            <p className="text-sm font-semibold mt-0.5 text-[#4CAF68]">{admin?.is_active ? (fr ? "Actif" : "Active") : (fr ? "Suspendu" : "Suspended")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
