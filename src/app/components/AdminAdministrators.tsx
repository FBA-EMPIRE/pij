import { useState, useRef } from "react";
import { Plus, Shield, UserPlus, Copy, RefreshCw, XCircle, CheckCircle, X, ChevronDown, ArrowUpCircle, ArrowDownCircle, UserMinus, UserCheck, Link, Mail } from "lucide-react";
import { ADMINS, ADMIN_INVITATIONS, CURRENT_ADMIN } from "./mockData";
import type { AdminRole } from "../types";

interface AdminAdministratorsProps {
  lang?: "fr" | "en";
}

function generateToken() {
  return "tok_pij_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export default function AdminAdministrators({ lang = "fr" }: AdminAdministratorsProps) {
  const fr = lang === "fr";
  const [tab, setTab] = useState<"active" | "invitations">("active");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "admin" as AdminRole });
  const [copyFeedback, setCopyFeedback] = useState("");
  const linkRef = useRef<HTMLInputElement>(null);

  const activeAdmins = ADMINS.filter((a) => a.status === "Active");
  const superAdminCount = ADMINS.filter((a) => a.role === "super_admin" && a.status === "Active").length;

  const handlePromote = (id: string) => {
    const a = ADMINS.find((ad) => ad.id === id);
    if (a) a.role = "super_admin";
  };

  const handleDemote = (id: string) => {
    if (superAdminCount <= 1) return;
    const a = ADMINS.find((ad) => ad.id === id);
    if (a) a.role = "admin";
  };

  const handleSuspend = (id: string) => {
    if (superAdminCount <= 1 && ADMINS.find((a) => a.id === id)?.role === "super_admin") return;
    const a = ADMINS.find((ad) => ad.id === id);
    if (a) a.status = "Suspended";
  };

  const handleReactivate = (id: string) => {
    const a = ADMINS.find((ad) => ad.id === id);
    if (a) a.status = "Active";
  };

  const handleSendInvitation = () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email) return;
    const token = generateToken();
    ADMIN_INVITATIONS.push({
      id: `AINV-${String(ADMIN_INVITATIONS.length + 1).padStart(3, "0")}`,
      email: inviteForm.email,
      role: inviteForm.role,
      token,
      status: "Pending",
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      createdBy: CURRENT_ADMIN.id,
    });
    setInviteForm({ firstName: "", lastName: "", email: "", phone: "", role: "admin" });
    setShowInvite(false);
  };

  const handleResend = (id: string) => {
    const inv = ADMIN_INVITATIONS.find((i) => i.id === id);
    if (inv) {
      inv.token = generateToken();
      inv.sentAt = new Date().toISOString();
      inv.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      inv.status = "Pending";
    }
  };

  const handleRevoke = (id: string) => {
    const inv = ADMIN_INVITATIONS.find((i) => i.id === id);
    if (inv) inv.status = "Revoked";
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/admin/invite/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopyFeedback(fr ? "Lien copié !" : "Link copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    });
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    return iso.split("T")[0];
  };

  const canDemoteLastSuperAdmin = () => superAdminCount <= 1;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Gestion des administrateurs" : "Administrator Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeAdmins.length} {fr ? "administrateur(s) actif(s)" : "active administrator(s)"}
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
          <UserPlus size={16} /> {fr ? "Inviter" : "Invite"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "active", label: fr ? "Administrateurs actifs" : "Active Administrators" },
          { key: "invitations", label: fr ? "Invitations en attente" : "Pending Invitations" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
            <span>{fr ? "ADMINISTRATEUR" : "ADMINISTRATOR"}</span>
            <span>{fr ? "RÔLE" : "ROLE"}</span>
            <span>STATUS</span>
            <span>{fr ? "DERNIÈRE CONNEXION" : "LAST LOGIN"}</span>
            <span>ACTIONS</span>
          </div>
          <div className="divide-y divide-border">
            {ADMINS.map((a) => {
              const isLastSuperAdmin = a.role === "super_admin" && superAdminCount <= 1;
              return (
                <div key={a.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr] gap-2 md:gap-4 px-5 py-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: a.initialsColor }}>
                      {a.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${a.role === "super_admin" ? "bg-[#F0E8FF] text-[#6E3A9A]" : "bg-[#E8F5EC] text-[#1F9D55]"}`}>
                      {a.role === "super_admin" ? (fr ? "Super Admin" : "Super Admin") : (fr ? "Admin" : "Admin")}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`w-2 h-2 rounded-full ${a.status === "Active" ? "bg-[#4CAF68]" : "bg-[#E8A317]"}`} />
                      {a.status === "Active" ? (fr ? "Actif" : "Active") : (fr ? "Suspendu" : "Suspended")}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {fr ? a.lastLoginFr : a.lastLogin}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.role === "admin" && (
                      <button onClick={() => handlePromote(a.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-[#6E3A9A] hover:bg-[#F0E8FF] transition-all">
                        <ArrowUpCircle size={12} /> {fr ? "Promouvoir" : "Promote"}
                      </button>
                    )}
                    {a.role === "super_admin" && !isLastSuperAdmin && (
                      <button onClick={() => handleDemote(a.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-[#E8A317] hover:bg-[#FEF3C7] transition-all">
                        <ArrowDownCircle size={12} /> {fr ? "Rétrograder" : "Demote"}
                      </button>
                    )}
                    {a.status === "Active" ? (
                      <button onClick={() => handleSuspend(a.id)} disabled={isLastSuperAdmin} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] hover:bg-red-50 disabled:opacity-30 transition-all">
                        <UserMinus size={12} /> {fr ? "Suspendre" : "Suspend"}
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(a.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-[#4CAF68] hover:bg-[#E8F5EC] transition-all">
                        <UserCheck size={12} /> {fr ? "Réactiver" : "Reactivate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {canDemoteLastSuperAdmin() && (
            <div className="px-5 py-3 text-xs text-[#E8A317] bg-[#FEF3C7]/50 border-t border-border">
              {fr ? "⚠ Le dernier Super Admin actif ne peut pas être rétrogradé ou suspendu." : "⚠ The last active Super Admin cannot be demoted or suspended."}
            </div>
          )}
        </div>
      )}

      {tab === "invitations" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {ADMIN_INVITATIONS.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{fr ? "Aucune invitation en attente" : "No pending invitations"}</p>
            </div>
          ) : (
            <>
              <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_1.5fr] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                <span>EMAIL</span>
                <span>{fr ? "RÔLE" : "ROLE"}</span>
                <span>{fr ? "STATUT" : "STATUS"}</span>
                <span>{fr ? "ENVOYÉE" : "SENT"}</span>
                <span>{fr ? "EXPIRATION" : "EXPIRATION"}</span>
                <span>ACTIONS</span>
              </div>
              <div className="divide-y divide-border">
                {ADMIN_INVITATIONS.map((inv) => {
                  const statusColors: Record<string, string> = {
                    Pending: "bg-[#FEF3C7] text-[#E8A317]",
                    Accepted: "bg-[#E8F5EC] text-[#1F9D55]",
                    Expired: "bg-red-50 text-[#E5484D]",
                    Revoked: "bg-muted text-muted-foreground",
                  };
                  return (
                    <div key={inv.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_1.5fr] gap-2 md:gap-4 px-5 py-4 items-center">
                      <div className="text-sm font-medium truncate">{inv.email}</div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${inv.role === "super_admin" ? "bg-[#F0E8FF] text-[#6E3A9A]" : "bg-[#E8F5EC] text-[#1F9D55]"}`}>
                          {inv.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[inv.status] || "bg-muted text-muted-foreground"}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(inv.sentAt)}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(inv.expiresAt)}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {inv.status === "Pending" && (
                          <>
                            <button onClick={() => handleResend(inv.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-all">
                              <RefreshCw size={12} /> {fr ? "Renvoyer" : "Resend"}
                            </button>
                            <button onClick={() => copyLink(inv.token)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-all">
                              <Link size={12} /> {fr ? "Lien" : "Link"}
                            </button>
                          </>
                        )}
                        {(inv.status === "Pending" || inv.status === "Accepted") && (
                          <button onClick={() => handleRevoke(inv.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] hover:bg-red-50 transition-all">
                            <XCircle size={12} /> {fr ? "Révoquer" : "Revoke"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {fr ? "Inviter un administrateur" : "Invite Administrator"}
              </h3>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded-lg hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{fr ? "Prénom" : "First name"}</label>
                  <input value={inviteForm.firstName} onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Nom" : "Last name"}</label>
                  <input value={inviteForm.lastName} onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Téléphone" : "Phone"}</label>
                <input value={inviteForm.phone} onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Rôle" : "Role"}</label>
                <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as AdminRole })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                  <option value="admin">{fr ? "Admin" : "Admin"}</option>
                  <option value="super_admin">{fr ? "Super Admin" : "Super Admin"}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button onClick={handleSendInvitation} disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90" style={{ background: "#4CAF68" }}>
                {fr ? "Envoyer l'invitation" : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy feedback toast */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg" style={{ background: "#4CAF68" }}>
          {copyFeedback}
        </div>
      )}
    </div>
  );
}
