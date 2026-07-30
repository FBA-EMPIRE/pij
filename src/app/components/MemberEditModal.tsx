import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { fetchUsers, kycApprove, kycReject } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";

interface MemberEditModalProps {
  memberId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function MemberEditModal({ memberId, onClose, onSave }: MemberEditModalProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const memberName = (m: any) =>
    [m?.profiles?.first_name, m?.profiles?.last_name].filter(Boolean).join(" ") || m?.email || "Unknown";

  useEffect(() => {
    fetchUsers().then((users) => {
      const found = users.find((u: any) => u.id === memberId);
      setMember(found ?? null);
      setLoading(false);
    });
  }, [memberId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kyc, setKyc] = useState("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setName(memberName(member));
      setEmail(member.email ?? "");
      setPhone(member.phone ?? "");
      setKyc(member.kyc_status ?? "pending");
    }
  }, [member]);

  if (loading) return null;
  if (!member) return null;

  const originalKyc = member.kyc_status ?? "pending";

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const { error: userErr } = await supabase
        .from("users")
        .update({ email, phone })
        .eq("id", memberId);
      if (userErr) throw userErr;

      if (kyc !== originalKyc) {
        if (kyc === "approved") {
          await kycApprove({ user_id: memberId });
        } else if (kyc === "rejected") {
          await kycReject({ user_id: memberId, note: rejectReason || undefined });
        } else {
          const { error: kycErr } = await supabase.from("users").update({ kyc_status: kyc }).eq("id", memberId);
          if (kycErr) throw kycErr;
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.message || (fr ? "Erreur lors de l'enregistrement." : "Error saving changes."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
            {fr ? "Modifier le membre" : "Edit member"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {memberName(member).split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{member.id}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{fr ? "Nom complet" : "Full name"}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>

          <div>
            <label className="text-sm font-medium">{fr ? "Téléphone" : "Phone"}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
          </div>

          <div>
            <label className="text-sm font-medium">KYC</label>
            <select value={kyc} onChange={(e) => setKyc(e.target.value as any)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
              <option value="approved">{fr ? "Approuvé" : "Approved"}</option>
              <option value="pending">{fr ? "En attente" : "Pending"}</option>
              <option value="rejected">{fr ? "Rejeté" : "Rejected"}</option>
            </select>
          </div>

          {kyc === "rejected" && kyc !== originalKyc && (
            <div>
              <label className="text-sm font-medium">{fr ? "Motif du rejet (optionnel)" : "Rejection reason (optional)"}</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: "#4CAF68" }}>
            {saving ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Enregistrer" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
