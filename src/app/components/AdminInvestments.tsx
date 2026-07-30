import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BarChart3, CheckCircle, Plus, TrendingUp, Wallet, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import {
  getCurrentUserId, fetchAdminInvestmentPortfolio, adjustInvestmentWallet,
  approveInvestmentRequest, rejectInvestmentRequest, distributeInvestmentReturn,
} from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";

type TabKey = "opportunities" | "investors" | "approvals" | "returns";
type FormMode = "create" | "edit" | null;
type AuditEntry = { id: string; action: string; detail: string; time: string };

export default function AdminInvestments() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<TabKey>("opportunities");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);

  const reload = async () => {
    const [opps, reqs, invs, port] = await Promise.all([
      supabase.from("investment_opportunities").select("*"),
      supabase.from("investment_requests").select("*, opportunity:investment_opportunities(title, title_en), member:users(email, profiles(first_name, last_name))"),
      supabase.from("users").select("*, profiles(first_name, last_name)"),
      fetchAdminInvestmentPortfolio().catch(() => []),
    ]);
    setOpportunities(opps.data ?? []);
    setRequests((reqs.data ?? []).map((r: any) => {
      const profile = r.member?.profiles;
      const memberName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (r.member?.email ?? "");
      return { ...r, opportunityTitle: fr ? r.opportunity?.title : r.opportunity?.title_en ?? r.opportunity?.title, memberName };
    }));
    setInvestors((invs.data ?? []).map((u: any) => ({ ...u, name: [u.profiles?.first_name, u.profiles?.last_name].filter(Boolean).join(" ") || u.email })));
    setPortfolio(port);
  };

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    getCurrentUserId().then(setAdminId).catch(() => setAdminId(null));
  }, []);

  const wallet = {
    available: 0,
    invested: portfolio.filter((p: any) => p.status === "Active").reduce((sum: number, p: any) => sum + Number(p.current_value ?? 0), 0),
    earnings: portfolio.reduce((sum: number, p: any) => sum + Number(p.returns ?? 0), 0),
  };

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
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Investissements" : "Investment Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{opportunities.length} {fr ? "opportunités" : "opportunities"} · {requests.length} {fr ? "demandes" : "requests"}</p>
        </div>
        {tab === "opportunities" && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
            <Plus size={16} /> {fr ? "Créer" : "Create"}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); closeForm(); }} className={`px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{actionError}</div>
      )}

      {formMode && tab === "opportunities" && (
        <OpportunityForm fr={fr} mode={formMode} opportunity={opportunities.find((o) => o.id === editingId)} onCancel={closeForm} onSave={async (fields: any) => {
          setActionError("");
          if (formMode === "edit" && editingId) {
            const { data, error } = await supabase.from("investment_opportunities").update(fields).eq("id", editingId).select().single();
            if (error) { setActionError(error.message); return; }
            setOpportunities((current) => current.map((o) => o.id === editingId ? data : o));
            addAudit("Opportunity Updated", data.title);
          } else {
            const { data, error } = await supabase.from("investment_opportunities").insert({ ...fields, raised: 0, image: "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)", created_by: adminId }).select().single();
            if (error) { setActionError(error.message); return; }
            setOpportunities((current) => [data, ...current]);
            addAudit("Opportunity Created", data.title);
          }
          closeForm();
        }} />
      )}

      {tab === "opportunities" && <Opportunities fr={fr} opportunities={opportunities} onEdit={openEdit} onPublish={async (id: string) => {
        setActionError("");
        const { data, error } = await supabase.from("investment_opportunities").update({ status: "Published" }).eq("id", id).select().single();
        if (error) { setActionError(error.message); return; }
        setOpportunities((current) => current.map((o) => o.id === id ? data : o));
        addAudit("Opportunity Published", data.title);
      }} onClose={async (id: string) => {
        setActionError("");
        const { data, error } = await supabase.from("investment_opportunities").update({ status: "Closed" }).eq("id", id).select().single();
        if (error) { setActionError(error.message); return; }
        setOpportunities((current) => current.map((o) => o.id === id ? data : o));
        addAudit("Opportunity Closed", data.title);
      }} />}
      {tab === "investors" && <Investors fr={fr} investors={investors} audit={audit} onAdjust={async (memberId: string, amount: number, action: "credit" | "debit") => {
        setActionError("");
        await adjustInvestmentWallet({ user_id: memberId, amount, action });
        await reload();
        addAudit(action === "credit" ? "Wallet Credited" : "Wallet Debited", `${memberId} · ${formatXAF(amount)}`);
      }} onError={setActionError} />}
      {tab === "approvals" && <Approvals fr={fr} requests={requests} onDecision={async (id: string, status: string) => {
        setActionError("");
        if (status === "Approved") await approveInvestmentRequest({ request_id: id });
        else await rejectInvestmentRequest({ request_id: id });
        await reload();
        addAudit(status === "Approved" ? "Investment Approved" : "Investment Rejected", `${id}`);
      }} onError={setActionError} />}
      {tab === "returns" && <Returns fr={fr} wallet={wallet} audit={audit} portfolio={portfolio} onDistribute={async (portfolioId: string, kind: "profit" | "loss", amount: number) => {
        setActionError("");
        await distributeInvestmentReturn({ portfolio_id: portfolioId, amount, kind });
        await reload();
        addAudit(kind === "profit" ? "Profit Recorded" : "Loss Recorded", `${formatXAF(amount)}`);
      }} onError={setActionError} />}
    </div>
  );
}

function Opportunities({ fr, opportunities, onEdit, onPublish, onClose }: { fr: boolean; opportunities: any[]; onEdit: (id: string) => void; onPublish: (id: string) => void; onClose: (id: string) => void }) {
  return <div className="space-y-4">{opportunities.map((opportunity: any) => <div key={opportunity.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{opportunity.title}</h3><StatusBadge status={opportunity.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{opportunity.category} · ROI {opportunity.roi} · {opportunity.duration} · {fr ? "Risque" : "Risk"} {opportunity.risk}</p><p className="text-sm text-muted-foreground mt-3 max-w-2xl">{opportunity.description}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onEdit(opportunity.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button><button onClick={() => onPublish(opportunity.id)} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Publier" : "Publish"}</button><button onClick={() => onClose(opportunity.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Fermer" : "Close"}</button></div></div></div>)}</div>;
}

function Investors({ fr, investors, audit, onAdjust, onError }: { fr: boolean; investors: any[]; audit: AuditEntry[]; onAdjust: (memberId: string, amount: number, action: "credit" | "debit") => Promise<void>; onError: (msg: string) => void }) {
  return <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Comptes investisseurs" : "Investor accounts"}</h3><div className="space-y-2">{investors.map((m: any) => <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div className="w-9 h-9 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold">{(m.name ?? m.id).split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div><div className="flex-1"><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.id}</p></div><p className="text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.balance_investment ?? 0)}</p></div>)}</div></div><AdjustmentForm fr={fr} investors={investors} audit={audit} onAdjust={onAdjust} onError={onError} /></div>;
}

function AdjustmentForm({ fr, investors, audit, onAdjust, onError }: { fr: boolean; investors: any[]; audit: AuditEntry[]; onAdjust: (memberId: string, amount: number, action: "credit" | "debit") => Promise<void>; onError: (msg: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  return <form onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const memberId = String(data.get("memberId") || investors[0]?.id);
    const amount = Number(data.get("amount") || 0);
    const action = String(data.get("action")) === "debit" ? "debit" : "credit";
    if (!(amount > 0)) return;
    setSubmitting(true);
    try {
      await onAdjust(memberId, amount, action);
      form.reset();
    } catch (err: any) {
      onError(err?.message || (fr ? "Erreur lors de l'ajustement." : "Error adjusting wallet."));
    } finally {
      setSubmitting(false);
    }
  }} className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Ajustement auditable" : "Auditable adjustment"}</h3><div className="space-y-3"><select name="memberId" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm">{investors.map((m: any) => <option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}</select><input name="amount" type="number" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm" placeholder="100000" /><select name="action" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm"><option value="credit">{fr ? "Créditer" : "Credit"}</option><option value="debit">{fr ? "Débiter" : "Debit"}</option></select><div className="rounded-xl bg-[#F0E8FF] p-3 text-xs text-[#6E3A9A] space-y-1"><p>✓ {fr ? "Transaction créée" : "Transaction created"}</p><p>✓ {fr ? "Audit log enregistré" : "Audit log recorded"}</p><p>✓ {fr ? "Notification utilisateur envoyée" : "User notification sent"}</p></div><button disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>{submitting && <Loader2 size={14} className="animate-spin" />}{fr ? "Confirmer l'ajustement" : "Confirm adjustment"}</button>{audit.length > 0 && <AuditList audit={audit} />}</div></form>;
}

function Approvals({ fr, requests, onDecision, onError }: { fr: boolean; requests: any[]; onDecision: (id: string, status: string) => Promise<void>; onError: (msg: string) => void }) {
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const handleDecision = async (id: string, status: string) => {
    setDecidingId(id);
    try {
      await onDecision(id, status);
    } catch (err: any) {
      onError(err?.message || (fr ? "Erreur lors de la décision." : "Error processing decision."));
    } finally {
      setDecidingId(null);
    }
  };
  return <div className="space-y-4">{requests.map((request: any) => <div key={request.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col sm:flex-row sm:items-center gap-4"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-semibold">{request.opportunityTitle}</h3><StatusBadge status={request.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{request.memberName} · {formatXAF(request.amount)} · {request.submitted_at?.slice(0, 10)}</p><p className="text-xs text-muted-foreground mt-1">{fr ? "Décision crée notification et met à jour le portfolio." : "Decision creates notification and updates portfolio."}</p></div><div className="flex gap-2">{request.status === "Pending" ? <><button disabled={decidingId === request.id} onClick={() => handleDecision(request.id, "Approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs disabled:opacity-50" style={{ background: "#4CAF68" }}>{decidingId === request.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}{fr ? "Approuver" : "Approve"}</button><button disabled={decidingId === request.id} onClick={() => handleDecision(request.id, "Rejected")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] disabled:opacity-50"><XCircle size={13} />{fr ? "Rejeter" : "Reject"}</button></> : null}</div></div></div>)}</div>;
}

function Returns({ fr, wallet, audit, portfolio, onDistribute, onError }: { fr: boolean; wallet: any; audit: AuditEntry[]; portfolio: any[]; onDistribute: (portfolioId: string, kind: "profit" | "loss", amount: number) => Promise<void>; onError: (msg: string) => void }) {
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-[#E8F5EC] flex items-center justify-center mb-3"><Wallet size={18} color="#4CAF68" /></div><p className="text-sm text-muted-foreground">{fr ? "Solde investi" : "Invested balance"}</p><p className="text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(wallet.invested ?? 0)}</p></div><div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-[#F0E8FF] flex items-center justify-center mb-3"><TrendingUp size={18} color="#6E3A9A" /></div><p className="text-sm text-muted-foreground">{fr ? "Gains enregistrés" : "Recorded returns"}</p><p className="text-2xl font-bold text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(wallet.earnings ?? 0)}</p></div><ReturnsForm fr={fr} audit={audit} portfolio={portfolio} onDistribute={onDistribute} onError={onError} /></div>;
}

function ReturnsForm({ fr, audit, portfolio, onDistribute, onError }: { fr: boolean; audit: AuditEntry[]; portfolio: any[]; onDistribute: (portfolioId: string, kind: "profit" | "loss", amount: number) => Promise<void>; onError: (msg: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const activePortfolio = portfolio.filter((p: any) => p.status === "Active");
  if (activePortfolio.length === 0) {
    return <div className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Distribution auditable" : "Auditable distribution"}</h3><p className="text-sm text-muted-foreground">{fr ? "Aucun investissement actif à ajuster." : "No active investments to adjust."}</p></div>;
  }
  return <form onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const portfolioId = String(data.get("portfolioId") || activePortfolio[0]?.id);
    const kind = String(data.get("kind")) === "loss" ? "loss" : "profit";
    const amount = Number(data.get("amount") || 0);
    if (!(amount > 0)) return;
    setSubmitting(true);
    try {
      await onDistribute(portfolioId, kind, amount);
      form.reset();
    } catch (err: any) {
      onError(err?.message || (fr ? "Erreur lors de la distribution." : "Error distributing return."));
    } finally {
      setSubmitting(false);
    }
  }} className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Distribution auditable" : "Auditable distribution"}</h3><select name="portfolioId" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3">{activePortfolio.map((p: any) => <option key={p.id} value={p.id}>{p.memberName} · {fr ? p.opportunity?.title : p.opportunity?.title_en ?? p.opportunity?.title}</option>)}</select><select name="kind" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3"><option value="profit">{fr ? "Profit" : "Profit"}</option><option value="loss">{fr ? "Perte" : "Loss"}</option></select><input name="amount" type="number" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm mb-3" placeholder="17500" /><div className="rounded-xl bg-[#E8F5EC] p-3 text-xs text-[#1F9D55] mb-3"><BarChart3 size={13} className="inline mr-1" />{fr ? "Créera transaction, audit log et notification." : "Creates transaction, audit log and notification."}</div><button disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>{submitting && <Loader2 size={14} className="animate-spin" />}{fr ? "Distribuer" : "Distribute"}</button>{audit.length > 0 && <AuditList audit={audit} />}</form>;
}

function OpportunityForm({ fr, mode, opportunity, onSave, onCancel }: { fr: boolean; mode: Exclude<FormMode, null>; opportunity?: any; onSave: (fields: any) => void; onCancel: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ title: String(data.get("title") || ""), title_en: String(data.get("titleEn") || data.get("title") || ""), category: String(data.get("category") || ""), description: String(data.get("description") || ""), roi: String(data.get("roi") || ""), duration: String(data.get("duration") || ""), risk: String(data.get("risk") || ""), min_amount: Number(data.get("minAmount") || 0), max_amount: Number(data.get("maxAmount") || 0), goal: Number(data.get("goal") || 0), status: String(data.get("status") || "") }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{mode === "create" ? (fr ? "Créer une opportunité" : "Create opportunity") : (fr ? "Modifier l'opportunité" : "Edit opportunity")}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field name="title" label={fr ? "Titre" : "Title"} defaultValue={opportunity?.title} /><Field name="titleEn" label={fr ? "Titre anglais" : "English title"} defaultValue={opportunity?.title_en} /><Field name="category" label={fr ? "Catégorie" : "Category"} defaultValue={opportunity?.category} /><Field name="roi" label="ROI" defaultValue={opportunity?.roi} /><Field name="duration" label={fr ? "Durée" : "Duration"} defaultValue={opportunity?.duration} /><SelectField name="risk" label={fr ? "Risque" : "Risk"} defaultValue={opportunity?.risk} options={["Faible", "Modéré", "Élevé"].map((value) => ({ value, label: value }))} /><Field name="minAmount" label={fr ? "Montant minimum" : "Minimum amount"} type="number" defaultValue={String(opportunity?.min_amount ?? "")} /><Field name="maxAmount" label={fr ? "Montant maximum" : "Maximum amount"} type="number" defaultValue={String(opportunity?.max_amount ?? 5000000)} /></div><TextareaField name="description" label="Description" defaultValue={opportunity?.description} /><SelectField name="status" label="Status" defaultValue={opportunity?.status} options={["Published", "Draft", "Closed"].map((value) => ({ value, label: value }))} /><FormActions fr={fr} onCancel={onCancel} /></form>;
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

function FormActions({ fr, onCancel }: { fr: boolean; onCancel: () => void }) {
  return <div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button><button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Enregistrer" : "Save"}</button></div>;
}
