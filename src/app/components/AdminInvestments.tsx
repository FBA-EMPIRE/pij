import { useState } from "react";
import { BarChart3, CheckCircle, Plus, TrendingUp, Wallet, XCircle } from "lucide-react";
import { INVESTMENT_OPPORTUNITIES, INVESTMENT_REQUESTS, INVESTMENT_WALLET, MEMBERS, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";

type Opportunity = typeof INVESTMENT_OPPORTUNITIES[number];
type Request = typeof INVESTMENT_REQUESTS[number];
type Investor = typeof MEMBERS[number];
type TabKey = "opportunities" | "investors" | "approvals" | "returns";
type FormMode = "create" | "edit" | null;
type AuditEntry = { id: string; action: string; detail: string; time: string };

export default function AdminInvestments() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<TabKey>("opportunities");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INVESTMENT_OPPORTUNITIES);
  const [requests, setRequests] = useState<Request[]>(INVESTMENT_REQUESTS);
  const [investors, setInvestors] = useState<Investor[]>(MEMBERS.slice(0, 5));
  const [wallet, setWallet] = useState(INVESTMENT_WALLET);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "opportunities", label: fr ? "Opportunités" : "Opportunities" },
    { key: "investors", label: fr ? "Investisseurs" : "Investors" },
    { key: "approvals", label: fr ? "Approbations" : "Approvals" },
    { key: "returns", label: fr ? "Rendements" : "Returns" },
  ];

  const addAudit = (action: string, detail: string) => {
    setAudit((current) => [{ id: `AUD-${Date.now()}`, action, detail, time: new Date().toLocaleString("fr-FR") }, ...current].slice(0, 6));
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingId(null);
  };

  const openEdit = (id: string) => {
    setFormMode("edit");
    setEditingId(id);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Investissements" : "Investment Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{opportunities.length} {fr ? "opportunités" : "opportunities"} · {requests.length} {fr ? "demandes" : "requests"}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Créer" : "Create"}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); closeForm(); }} className={`px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {formMode && tab === "opportunities" && (
        <OpportunityForm fr={fr} mode={formMode} opportunity={opportunities.find((o) => o.id === editingId)} onCancel={closeForm} onSave={(opportunity) => {
          setOpportunities((current) => formMode === "edit" ? current.map((o) => o.id === opportunity.id ? opportunity : o) : [{ ...opportunity, id: `INV-${Date.now()}`, raised: 0, image: "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)" }, ...current]);
          addAudit(formMode === "edit" ? "Opportunity Updated" : "Opportunity Created", opportunity.title);
          closeForm();
        }} />
      )}

      {tab === "opportunities" && <Opportunities fr={fr} opportunities={opportunities} onEdit={openEdit} onPublish={(id) => { setOpportunities((current) => current.map((o) => o.id === id ? { ...o, status: "Published" } : o)); addAudit("Opportunity Published", id); }} onClose={(id) => { setOpportunities((current) => current.map((o) => o.id === id ? { ...o, status: "Closed" } : o)); addAudit("Opportunity Closed", id); }} />}
      {tab === "investors" && <Investors fr={fr} investors={investors} audit={audit} onAdjust={(memberId, amount, action) => { setInvestors((current) => current.map((m) => m.id === memberId ? { ...m, balance_current: action === "credit" ? m.balance_current + amount : Math.max(0, m.balance_current - amount) } : m)); addAudit(action === "credit" ? "Wallet Credited" : "Wallet Debited", `${memberId} · ${formatXAF(amount)} · transaction + audit + notification`); }} />}
      {tab === "approvals" && <Approvals fr={fr} requests={requests} onDecision={(id, status) => { setRequests((current) => current.map((r) => r.id === id ? { ...r, status } : r)); addAudit(status === "Approved" ? "Investment Approved" : "Investment Rejected", `${id} · user notification + portfolio update`); }} />}
      {tab === "returns" && <Returns fr={fr} wallet={wallet} audit={audit} onDistribute={(kind, amount) => { setWallet((current) => ({ ...current, earnings: kind === "profit" ? current.earnings + amount : Math.max(0, current.earnings - amount) })); addAudit(kind === "profit" ? "Profit Recorded" : "Loss Recorded", `${formatXAF(amount)} · transaction + audit + notification`); }} />}
    </div>
  );
}

function Opportunities({ fr, opportunities, onEdit, onPublish, onClose }: { fr: boolean; opportunities: Opportunity[]; onEdit: (id: string) => void; onPublish: (id: string) => void; onClose: (id: string) => void }) {
  return <div className="space-y-4">{opportunities.map((opportunity) => <div key={opportunity.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{opportunity.title}</h3><StatusBadge status={opportunity.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{opportunity.category} · ROI {opportunity.roi} · {opportunity.duration} · {fr ? "Risque" : "Risk"} {opportunity.risk}</p><p className="text-sm text-muted-foreground mt-3 max-w-2xl">{opportunity.description}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onEdit(opportunity.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button><button onClick={() => onPublish(opportunity.id)} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Publier" : "Publish"}</button><button onClick={() => onClose(opportunity.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Fermer" : "Close"}</button></div></div></div>)}</div>;
}

function Investors({ fr, investors, audit, onAdjust }: { fr: boolean; investors: Investor[]; audit: AuditEntry[]; onAdjust: (memberId: string, amount: number, action: "credit" | "debit") => void }) {
  return <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Comptes investisseurs" : "Investor accounts"}</h3><div className="space-y-2">{investors.map((m) => <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div><div className="flex-1"><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.id}</p></div><p className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.balance_current)}</p></div>)}</div></div><AdjustmentForm fr={fr} investors={investors} audit={audit} onAdjust={onAdjust} /></div>;
}

function AdjustmentForm({ fr, investors, audit, onAdjust }: { fr: boolean; investors: Investor[]; audit: AuditEntry[]; onAdjust: (memberId: string, amount: number, action: "credit" | "debit") => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const memberId = String(data.get("memberId") || investors[0]?.id); const amount = Number(data.get("amount") || 0); const action = String(data.get("action")) === "debit" ? "debit" : "credit"; if (amount > 0) onAdjust(memberId, amount, action); event.currentTarget.reset(); }} className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Ajustement auditable" : "Auditable adjustment"}</h3><div className="space-y-3"><select name="memberId" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm">{investors.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}</select><input name="amount" type="number" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm" placeholder="100000" /><select name="action" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm"><option value="credit">{fr ? "Créditer" : "Credit"}</option><option value="debit">{fr ? "Débiter" : "Debit"}</option></select><div className="rounded-xl bg-[#F0E8FF] p-3 text-xs text-[#6E3A9A] space-y-1"><p>✓ {fr ? "Transaction créée" : "Transaction created"}</p><p>✓ {fr ? "Audit log enregistré" : "Audit log recorded"}</p><p>✓ {fr ? "Notification utilisateur envoyée" : "User notification sent"}</p></div><button className="w-full py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Confirmer l'ajustement" : "Confirm adjustment"}</button>{audit.length > 0 && <AuditList audit={audit} />}</div></form>;
}

function Approvals({ fr, requests, onDecision }: { fr: boolean; requests: Request[]; onDecision: (id: string, status: "Approved" | "Rejected") => void }) {
  return <div className="space-y-4">{requests.map((request) => <div key={request.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col sm:flex-row sm:items-center gap-4"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-semibold">{request.opportunity}</h3><StatusBadge status={request.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{request.member} · {formatXAF(request.amount)} · {request.submitted}</p><p className="text-xs text-muted-foreground mt-1">{fr ? "Décision crée notification et met à jour le portfolio." : "Decision creates notification and updates portfolio."}</p></div><div className="flex gap-2"><button onClick={() => onDecision(request.id, "Approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}><CheckCircle size={13} />{fr ? "Approuver" : "Approve"}</button><button onClick={() => onDecision(request.id, "Rejected")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]"><XCircle size={13} />{fr ? "Rejeter" : "Reject"}</button></div></div></div>)}</div>;
}

function Returns({ fr, wallet, audit, onDistribute }: { fr: boolean; wallet: typeof INVESTMENT_WALLET; audit: AuditEntry[]; onDistribute: (kind: "profit" | "loss", amount: number) => void }) {
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-[#E8F5EC] flex items-center justify-center mb-3"><Wallet size={18} color="#4CAF68" /></div><p className="text-sm text-muted-foreground">{fr ? "Solde investi" : "Invested balance"}</p><p className="text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(wallet.invested)}</p></div><div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-[#F0E8FF] flex items-center justify-center mb-3"><TrendingUp size={18} color="#6E3A9A" /></div><p className="text-sm text-muted-foreground">{fr ? "Gains enregistrés" : "Recorded returns"}</p><p className="text-2xl font-bold text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(wallet.earnings)}</p></div><ReturnsForm fr={fr} audit={audit} onDistribute={onDistribute} /></div>;
}

function ReturnsForm({ fr, audit, onDistribute }: { fr: boolean; audit: AuditEntry[]; onDistribute: (kind: "profit" | "loss", amount: number) => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const kind = String(data.get("kind")) === "loss" ? "loss" : "profit"; const amount = Number(data.get("amount") || 0); if (amount > 0) onDistribute(kind, amount); event.currentTarget.reset(); }} className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Distribution auditable" : "Auditable distribution"}</h3><select name="kind" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3"><option value="profit">{fr ? "Profit" : "Profit"}</option><option value="loss">{fr ? "Perte" : "Loss"}</option></select><input name="amount" type="number" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3" placeholder="17500" /><div className="rounded-xl bg-[#E8F5EC] p-3 text-xs text-[#1F9D55] mb-3"><BarChart3 size={13} className="inline mr-1" />{fr ? "Créera transaction, audit log et notification." : "Creates transaction, audit log and notification."}</div><button className="w-full py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Distribuer" : "Distribute"}</button>{audit.length > 0 && <AuditList audit={audit} />}</form>;
}

function OpportunityForm({ fr, mode, opportunity, onSave, onCancel }: { fr: boolean; mode: Exclude<FormMode, null>; opportunity?: Opportunity; onSave: (opportunity: Opportunity) => void; onCancel: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ ...opportunity, id: opportunity?.id ?? "", title: String(data.get("title") || ""), titleEn: String(data.get("titleEn") || data.get("title") || ""), category: String(data.get("category") || "Agriculture"), description: String(data.get("description") || ""), roi: String(data.get("roi") || "10%"), duration: String(data.get("duration") || "12 mois"), risk: String(data.get("risk") || "Faible"), minAmount: Number(data.get("minAmount") || 0), maxAmount: Number(data.get("maxAmount") || 0), goal: Number(data.get("goal") || 0), status: String(data.get("status") || "Published"), featured: opportunity?.featured ?? false, raised: opportunity?.raised ?? 0, image: opportunity?.image ?? "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)" }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{mode === "create" ? (fr ? "Créer une opportunité" : "Create opportunity") : (fr ? "Modifier l'opportunité" : "Edit opportunity")}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field name="title" label={fr ? "Titre" : "Title"} defaultValue={opportunity?.title} /><Field name="titleEn" label={fr ? "Titre anglais" : "English title"} defaultValue={opportunity?.titleEn} /><Field name="category" label={fr ? "Catégorie" : "Category"} defaultValue={opportunity?.category} /><Field name="roi" label="ROI" defaultValue={opportunity?.roi} /><Field name="duration" label={fr ? "Durée" : "Duration"} defaultValue={opportunity?.duration} /><SelectField name="risk" label={fr ? "Risque" : "Risk"} defaultValue={opportunity?.risk} options={["Faible", "Modéré", "Élevé"].map((value) => ({ value, label: value }))} /><Field name="minAmount" label={fr ? "Montant minimum" : "Minimum amount"} type="number" defaultValue={String(opportunity?.minAmount ?? 50000)} /><Field name="maxAmount" label={fr ? "Montant maximum" : "Maximum amount"} type="number" defaultValue={String(opportunity?.maxAmount ?? 1000000)} /><Field name="goal" label={fr ? "Objectif" : "Goal"} type="number" defaultValue={String(opportunity?.goal ?? 5000000)} /><SelectField name="status" label="Status" defaultValue={opportunity?.status} options={["Published", "Draft", "Closed"].map((value) => ({ value, label: value }))} /></div><TextareaField name="description" label="Description" defaultValue={opportunity?.description} /><div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button><button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Enregistrer" : "Save"}</button></div></form>;
}

function AuditList({ audit }: { audit: AuditEntry[] }) {
  return <div className="pt-3 mt-3 border-t border-border space-y-2">{audit.slice(0, 3).map((entry) => <div key={entry.id} className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{entry.action}</span> · {entry.detail}<br /><span className="text-muted-foreground/70">{entry.time}</span></div>)}</div>;
}

function Field({ name, label, defaultValue = "", type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return <div><label className="text-sm font-medium">{label}</label><input name={name} type={type} defaultValue={defaultValue} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" /></div>;
}

function TextareaField({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return <div><label className="text-sm font-medium">{label}</label><textarea name={name} defaultValue={defaultValue} rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" /></div>;
}

function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return <div><label className="text-sm font-medium">{label}</label><select name={name} defaultValue={defaultValue ?? options[0]?.value} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
