import { useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { MEMBERS, TRANSACTIONS, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface AccountManagementProps {
  lang?: "fr" | "en";
}

export default function AccountManagement({ lang = "fr" }: AccountManagementProps) {
  const fr = lang === "fr";
  const [tab, setTab] = useState<"accounts" | "deposit" | "withdrawal">("accounts");
  const [selectedMember, setSelectedMember] = useState(MEMBERS[0].id);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => setDone(true);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des comptes" : "Account management"}</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "accounts", label: fr ? "Tous les comptes" : "All accounts" },
          { key: "deposit", label: fr ? "Enregistrer un dépôt" : "Record deposit" },
          { key: "withdrawal", label: fr ? "Enregistrer un retrait" : "Record withdrawal" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); setDone(false); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "accounts" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                  <th className="px-5 py-3 text-left">{fr ? "Membre" : "Member"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Solde courant" : "Current balance"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Solde épargne" : "Savings balance"}</th>
                  <th className="px-5 py-3 text-left">KYC</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.filter((m) => m.status === "Active").map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">
                          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.balance_current)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.balance_savings)}</td>
                    <td className="px-5 py-4"><StatusBadge status={m.kyc as any} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tab === "deposit" || tab === "withdrawal") && (
        <div className="max-w-lg">
          {done ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: tab === "deposit" ? "#E8F5EC" : "#FEE2E2" }}>
                {tab === "deposit" ? <ArrowDownLeft size={24} color="#4CAF68" /> : <ArrowUpRight size={24} color="#E5484D" />}
              </div>
              <h3 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
                {tab === "deposit" ? (fr ? "Dépôt enregistré" : "Deposit recorded") : (fr ? "Retrait enregistré" : "Withdrawal recorded")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">{fr ? "La transaction a été enregistrée avec succès." : "The transaction has been recorded successfully."}</p>
              <button onClick={() => { setDone(false); setAmount(""); setDesc(""); }} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>
                {fr ? "Enregistrer une autre" : "Record another"}
              </button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border mb-2" style={{ background: tab === "deposit" ? "#E8F5EC" : "#FEE2E2" }}>
                {tab === "deposit" ? <ArrowDownLeft size={18} color="#4CAF68" /> : <ArrowUpRight size={18} color="#E5484D" />}
                <span className="text-sm font-medium" style={{ color: tab === "deposit" ? "#1F9D55" : "#E5484D" }}>
                  {tab === "deposit" ? (fr ? "Enregistrer un dépôt" : "Record a deposit") : (fr ? "Enregistrer un retrait" : "Record a withdrawal")}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Membre" : "Member"}</label>
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                  {MEMBERS.filter((m) => m.status === "Active").map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Type de compte" : "Account type"}</label>
                <select className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                  <option>{fr ? "Compte courant" : "Current account"}</option>
                  <option>{fr ? "Compte épargne" : "Savings account"}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Montant (XAF)" : "Amount (XAF)"}</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="100 000" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Description" : "Description"}</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={tab === "deposit" ? (fr ? "Dépôt mensuel..." : "Monthly deposit...") : (fr ? "Retrait courant..." : "Regular withdrawal...")} />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Référence (optionnel)" : "Reference (optional)"}</label>
                <input className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="REF-XXXX" />
              </div>
              <button onClick={handleSubmit} disabled={!amount} className="w-full py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all" style={{ background: tab === "deposit" ? "#4CAF68" : "#E5484D" }}>
                {tab === "deposit" ? (fr ? "Enregistrer le dépôt" : "Record deposit") : (fr ? "Enregistrer le retrait" : "Record withdrawal")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
