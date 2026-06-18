import { useState } from "react";
import { X } from "lucide-react";
import { MEMBERS } from "./mockData";

interface MemberEditModalProps {
  memberId: string;
  lang?: "fr" | "en";
  onClose: () => void;
  onSave: () => void;
}

export default function MemberEditModal({ memberId, lang = "fr", onClose, onSave }: MemberEditModalProps) {
  const fr = lang === "fr";
  const member = MEMBERS.find((m) => m.id === memberId);
  if (!member) return null;

  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone);
  const [status, setStatus] = useState(member.status);
  const [kyc, setKyc] = useState(member.kyc);

  const handleSave = () => {
    member.name = name;
    member.email = email;
    member.phone = phone;
    member.status = status;
    member.kyc = kyc;
    onSave();
    onClose();
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
              {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{fr ? "Statut" : "Status"}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                <option value="Active">Active</option>
                <option value="Pending">{fr ? "En attente" : "Pending"}</option>
                <option value="Suspended">{fr ? "Suspendu" : "Suspended"}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">KYC</label>
              <select value={kyc} onChange={(e) => setKyc(e.target.value as any)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                <option value="Approved">{fr ? "Approuvé" : "Approved"}</option>
                <option value="Pending">{fr ? "En attente" : "Pending"}</option>
                <option value="Rejected">{fr ? "Rejeté" : "Rejected"}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
            {fr ? "Enregistrer" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
