import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Eye, Edit, UserX, UserCheck, Loader2, ArrowLeft, GraduationCap, ShieldOff } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import MemberDetailModal from "./MemberDetailModal";
import MemberEditModal from "./MemberEditModal";
import ConfirmAssignFormateur from "./modals/ConfirmAssignFormateur";
import { useAppContext } from "../context/AppContext";
import { fetchAccountsWithUsers, fetchAdmins } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";
import { formatXAF } from "../lib/format";

const ROLE_BADGE: Record<string, { bg: string; text: string; fr: string; en: string }> = {
  super_admin: { bg: "#FDECEC", text: "#E5484D", fr: "Super Admin", en: "Super Admin" },
  admin: { bg: "#E7F1FC", text: "#2E7DD1", fr: "Administrateur", en: "Admin" },
  formateur: { bg: "#E8F5EC", text: "#1F9D55", fr: "Formateur", en: "Trainer" },
  kyc_officer: { bg: "#F0E8FF", text: "#6E3A9A", fr: "Agent KYC", en: "KYC Officer" },
  support_agent: { bg: "#F0E8FF", text: "#6E3A9A", fr: "Support", en: "Support" },
};
const MEMBER_BADGE = { bg: "var(--muted)", text: "var(--muted-foreground)", fr: "Membre", en: "Member" };

export default function UserManagement() {
  const navigate = useNavigate();
  const { lang, userProfile } = useAppContext();
  const fr = lang === "fr";
  const isSuperAdmin = userProfile?.role === "super_admin";
  const [members, setMembers] = useState<any[]>([]);
  const [roleByUserId, setRoleByUserId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [formateurTarget, setFormateurTarget] = useState<{ id: string; name: string; action: "assign" | "revoke" } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; warning: boolean } | null>(null);

  const loadMembers = () => {
    setLoading(true);
    return Promise.all([fetchAccountsWithUsers(), fetchAdmins()])
      .then(([accountsData, adminsData]) => {
        setMembers(accountsData);
        const map: Record<string, string> = {};
        for (const a of adminsData as any[]) {
          if (a.roles?.name) map[a.id] = a.roles.name;
        }
        setRoleByUserId(map);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleToggleSuspend = async (m: any) => {
    const nextStatus = m.status === "suspended" ? "active" : "suspended";
    setSuspendingId(m.id);
    try {
      const { error: updateErr } = await supabase.from("users").update({ status: nextStatus }).eq("id", m.id);
      if (updateErr) throw updateErr;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        actor_id: currentUser?.id ?? null,
        action: nextStatus === "suspended" ? "Member Suspended" : "Member Reactivated",
        entity_type: "user",
        entity_id: m.id,
      });

      await loadMembers();
    } finally {
      setSuspendingId(null);
    }
  };

  const showFeedback = (message: string, warning = false) => {
    setFeedback({ message, warning });
    setTimeout(() => setFeedback(null), warning ? 6000 : 3500);
  };

  const handleFormateurDone = async () => {
    if (!formateurTarget) return;
    const { name, action } = formateurTarget;
    setFormateurTarget(null);
    await loadMembers();
    showFeedback(
      action === "assign"
        ? (fr ? `✅ ${name} a été assigné comme Formateur` : `✅ ${name} was assigned as Trainer`)
        : (fr ? `✅ Le rôle Formateur a été révoqué` : `✅ Trainer role revoked`)
    );
  };

  const filtered = members.filter((m) => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.uid?.includes(search) || m.phone?.includes(search);
    const matchKyc = kycFilter === "all" || (m.kyc_status ?? m.kyc)?.toLowerCase() === kycFilter;
    return matchSearch && matchKyc;
  });

  return (
    <div className="p-4 lg:p-6">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des membres" : "User management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} {fr ? "membres trouvés" : "members found"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            placeholder={fr ? "Rechercher par nom, UID, téléphone..." : "Search by name, UID, phone..."}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: fr ? "Tous" : "All" },
            { value: "approved", label: fr ? "Approuvés" : "Approved" },
            { value: "pending", label: fr ? "En attente" : "Pending" },
            { value: "rejected", label: fr ? "Rejetés" : "Rejected" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setKycFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                kycFilter === f.value ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                <th className="px-5 py-3 text-left">UID</th>
                <th className="px-5 py-3 text-left">{fr ? "Membre" : "Member"}</th>
                <th className="px-5 py-3 text-left">{fr ? "Téléphone" : "Phone"}</th>
                <th className="px-5 py-3 text-left">KYC</th>
                <th className="px-5 py-3 text-left">{fr ? "Rôle" : "Role"}</th>
                <th className="px-5 py-3 text-left">{fr ? "Statut" : "Status"}</th>
                <th className="px-5 py-3 text-right">{fr ? "Épargne" : "Savings"}</th>
                <th className="px-5 py-3 text-right">{fr ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Geist Mono, monospace" }}>{m.uid ?? m.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{m.phone}</td>
                  <td className="px-5 py-4"><StatusBadge status={m.kyc as any} size="sm" /></td>
                  <td className="px-5 py-4">
                    {(() => {
                      const role = roleByUserId[m.id];
                      const badge = role ? ROLE_BADGE[role] ?? MEMBER_BADGE : MEMBER_BADGE;
                      return (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: badge.bg, color: badge.text }}>
                          {fr ? badge.fr : badge.en}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={(m.status ?? "active") as any} size="sm" /></td>
                  <td className="px-5 py-4 text-right text-sm font-medium whitespace-nowrap" style={{ fontFamily: "Geist Mono, monospace" }}>
                    {(m.savings ?? 0) > 0 ? formatXAF(m.savings) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailMemberId(m.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title={fr ? "Voir" : "View"}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setEditMemberId(m.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title={fr ? "Modifier" : "Edit"}>
                        <Edit size={14} />
                      </button>
                      {isSuperAdmin && (
                        roleByUserId[m.id] === "formateur" ? (
                          <button
                            onClick={() => setFormateurTarget({ id: m.id, name: m.name, action: "revoke" })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-[#E5484D] hover:bg-red-50 transition-all"
                            title={fr ? "Révoquer le rôle Formateur" : "Revoke Trainer role"}
                          >
                            <ShieldOff size={14} />
                          </button>
                        ) : !roleByUserId[m.id] ? (
                          <button
                            onClick={() => setFormateurTarget({ id: m.id, name: m.name, action: "assign" })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-[#4CAF68] hover:bg-[#E8F5EC] transition-all"
                            title={fr ? "Assigner comme Formateur" : "Assign as Trainer"}
                          >
                            <GraduationCap size={14} />
                          </button>
                        ) : null
                      )}
                      {m.status === "suspended" ? (
                        <button
                          onClick={() => handleToggleSuspend(m)}
                          disabled={suspendingId === m.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-[#4CAF68] hover:bg-[#E8F5EC] transition-all disabled:opacity-50"
                          title={fr ? "Réactiver" : "Reactivate"}
                        >
                          {suspendingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleSuspend(m)}
                          disabled={suspendingId === m.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-[#E5484D] hover:bg-red-50 transition-all disabled:opacity-50"
                          title={fr ? "Suspendre" : "Suspend"}
                        >
                          {suspendingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailMemberId && (
        <MemberDetailModal memberId={detailMemberId} onClose={() => setDetailMemberId(null)} />
      )}
      {editMemberId && (
        <MemberEditModal memberId={editMemberId} onClose={() => setEditMemberId(null)} onSave={() => { setEditMemberId(null); loadMembers(); }} />
      )}
      {formateurTarget && (
        <ConfirmAssignFormateur
          userId={formateurTarget.id}
          userName={formateurTarget.name}
          currentRoleLabel={fr
            ? (roleByUserId[formateurTarget.id] ? ROLE_BADGE[roleByUserId[formateurTarget.id]]?.fr ?? MEMBER_BADGE.fr : MEMBER_BADGE.fr)
            : (roleByUserId[formateurTarget.id] ? ROLE_BADGE[roleByUserId[formateurTarget.id]]?.en ?? MEMBER_BADGE.en : MEMBER_BADGE.en)}
          action={formateurTarget.action}
          onClose={() => setFormateurTarget(null)}
          onDone={handleFormateurDone}
        />
      )}

      {feedback && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg"
          style={{ background: feedback.warning ? "#E8A317" : "#4CAF68" }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
