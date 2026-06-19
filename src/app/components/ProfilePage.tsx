import { useState } from "react";
import { User, Camera, Lock, Bell, Mail, Smartphone, Check, X } from "lucide-react";

import { useAppContext } from "../context/AppContext";

const NOTIFICATION_CATEGORIES = [
  { id: "contributions", icon: Bell, fr: "Contributions", en: "Contributions" },
  { id: "payouts", icon: Bell, fr: "Versements", en: "Payouts" },
  { id: "formations", icon: Bell, fr: "Formations", en: "Training" },
  { id: "promotions", icon: Bell, fr: "Promotions", en: "Promotions" },
] as const;

export default function ProfilePage() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name] = useState("Amara Diallo");
  const [email] = useState("amara.diallo@email.com");
  const [phone] = useState("+237 6 70 12 34 56");
  const [city] = useState("Yaoundé");
  const [notifications, setNotifications] = useState({
    contributions: true,
    payouts: true,
    formations: false,
    promotions: false,
  });
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const toggleNotif = (id: string) =>
    setNotifications((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Mon profil" : "My profile"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Gérez vos informations personnelles" : "Manage your personal information"}
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 min-h-[44px]"
          style={{ background: editing ? "#E5484D" : "#4CAF68", color: "#fff" }}
        >
          {editing
            ? fr ? "Annuler" : "Cancel"
            : fr ? "Modifier" : "Edit"}
        </button>
      </div>

      {/* Personal info card */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-2xl font-bold">
              AD
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-lg">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-semibold text-lg">{name}</p>
            <p className="text-sm text-muted-foreground">PIJ-2024-001</p>
            <p className="text-xs text-[#4CAF68] font-medium mt-1">
              {fr ? "Membre vérifié ✓" : "Verified member ✓"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {fr ? "Membre depuis le 15 janvier 2024" : "Member since January 15, 2024"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: fr ? "Nom complet" : "Full name", value: name, key: "name" },
            { label: "Email", value: email, key: "email", type: "email" },
            { label: fr ? "Téléphone" : "Phone", value: phone, key: "phone", type: "tel" },
            { label: fr ? "Ville" : "City", value: city, key: "city" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
              {editing ? (
                <input
                  type={f.type || "text"}
                  defaultValue={f.value}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 min-h-[44px]"
                />
              ) : (
                <p className="px-3 py-2.5 text-sm text-foreground bg-muted/30 rounded-xl">{f.value}</p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <button
            className="mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all min-h-[44px]"
            style={{ background: "#4CAF68" }}
            onClick={() => setEditing(false)}
          >
            {fr ? "Enregistrer les modifications" : "Save changes"}
          </button>
        )}
      </div>

      {/* Password change */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
              <Lock size={18} style={{ color: "#4CAF68" }} />
            </div>
            <div>
              <p className="font-medium text-sm">{fr ? "Mot de passe" : "Password"}</p>
              <p className="text-xs text-muted-foreground">
                {fr ? "Modifier votre mot de passe" : "Change your password"}
              </p>
            </div>
          </div>
          <ChevronDownIcon open={showPassword} />
        </button>
        {showPassword && (
          <div className="mt-5 space-y-4 border-t border-border pt-5">
            {[
              { label: fr ? "Mot de passe actuel" : "Current password", key: "current" },
              { label: fr ? "Nouveau mot de passe" : "New password", key: "newPass" },
              { label: fr ? "Confirmer le mot de passe" : "Confirm password", key: "confirm" },
            ].map((p) => (
              <div key={p.key}>
                <label className="text-xs text-muted-foreground block mb-1">{p.label}</label>
                <input
                  type="password"
                  value={passwords[p.key as keyof typeof passwords]}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, [p.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 min-h-[44px]"
                />
              </div>
            ))}
            <button
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all min-h-[44px]"
              style={{ background: "#4CAF68" }}
            >
              {fr ? "Mettre à jour" : "Update password"}
            </button>
          </div>
        )}
      </div>

      {/* Notification preferences */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF68]/10 flex items-center justify-center shrink-0">
            <Bell size={18} style={{ color: "#4CAF68" }} />
          </div>
          <div>
            <p className="font-medium text-sm">{fr ? "Notifications" : "Notifications"}</p>
            <p className="text-xs text-muted-foreground">
              {fr ? "Gérez vos préférences de notification" : "Manage your notification preferences"}
            </p>
          </div>
        </div>

        {/* Notification categories */}
        <div className="space-y-3 mb-5">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const id = cat.id as keyof typeof notifications;
            return (
              <label key={id} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm">{fr ? cat.fr : cat.en}</span>
                <ToggleSwitch checked={notifications[id]} onChange={() => toggleNotif(id)} />
              </label>
            );
          })}
        </div>

        {/* Notification channels */}
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {fr ? "Canaux" : "Channels"}
          </p>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-sm">Email</span>
            </div>
            <ToggleSwitch checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-muted-foreground" />
              <span className="text-sm">SMS</span>
            </div>
            <ToggleSwitch checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-muted-foreground" />
              <span className="text-sm">Push</span>
            </div>
            <ToggleSwitch checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
          </label>
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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
