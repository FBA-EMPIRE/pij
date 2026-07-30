import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, ArrowDownLeft, ArrowUpRight, Check, ChevronsUpDown, Loader2, ArrowLeft } from "lucide-react";
import { fetchAccountsWithUsers, getCurrentUserId, recordDeposit, recordWithdrawal } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_MAP } from "../constants";
import { useAppContext } from "../context/AppContext";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={i} className="bg-[#4CAF68]/30 text-inherit rounded-sm px-0.5">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AccountManagement() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"accounts" | "deposit" | "withdrawal">("accounts");

  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId).catch(() => {});
    fetchAccountsWithUsers().then(setMembers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMember, setSelectedMember] = useState("");
  const [accountType, setAccountType] = useState<string>("current");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);

  const reset = () => {
    setStep(1);
    setSelectedMember(members[0]?.id || "");
    setAccountType("current");
    setAmount("");
    setDesc("");
    setDone(false);
    setSubmitError("");
    setMemberSearch("");
  };

  const selectedMemberData = members.find((m) => m.id === selectedMember);

  const handleSubmit = async () => {
    if (!currentUserId) return;
    setSubmitError("");
    setSubmitting(true);
    const payload = {
      user_id: selectedMember,
      amount: Number(amount),
      account_type: accountType || undefined,
      description: desc || undefined,
    };
    try {
      if (tab === "deposit") {
        await recordDeposit(payload);
      } else {
        await recordWithdrawal(payload);
      }
      setDone(true);
      fetchAccountsWithUsers().then(setMembers).catch(() => {});
    } catch (err: any) {
      setSubmitError(err?.message || (fr ? "Erreur lors de l'enregistrement." : "Error recording transaction."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des comptes" : "Account management"}</h2>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "accounts", label: fr ? "Tous les comptes" : "All accounts" },
          { key: "deposit", label: fr ? "Enregistrer un dépôt" : "Record deposit" },
          { key: "withdrawal", label: fr ? "Enregistrer un retrait" : "Record withdrawal" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); reset(); }}
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
                  <th className="px-5 py-3 text-right">{fr ? "Solde courant" : "Current"}</th>
                  <th className="px-5 py-3 text-right">{fr ? "Épargne" : "Savings"}</th>
                  <th className="px-5 py-3 text-left">KYC</th>
                </tr>
              </thead>
              <tbody>
                      {members.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4CAF68] flex items-center justify-center text-white text-xs font-bold">
                          {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.current)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-[#1F9D55]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(m.savings)}</td>
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
              <button onClick={reset} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>
                {fr ? "Enregistrer une autre" : "Record another"}
              </button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s ? "bg-[#4CAF68] text-white" : step > s ? "bg-[#4CAF68]/20 text-[#4CAF68]" : "bg-muted text-muted-foreground"
                    }`}>
                      {step > s ? <Check size={14} /> : s}
                    </div>
                    {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-[#4CAF68]" : "bg-muted"}`} />}
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border mb-2" style={{ background: tab === "deposit" ? "#E8F5EC" : "#FEE2E2" }}>
                {tab === "deposit" ? <ArrowDownLeft size={18} color="#4CAF68" /> : <ArrowUpRight size={18} color="#E5484D" />}
                <span className="text-sm font-medium" style={{ color: tab === "deposit" ? "#1F9D55" : "#E5484D" }}>
                  {tab === "deposit" ? (fr ? "Nouveau dépôt" : "New deposit") : (fr ? "Nouveau retrait" : "New withdrawal")}
                </span>
              </div>

              {/* Step 1: Member + Account Type */}
              {step === 1 && (
                <>
                  <div>
                    <label className="text-sm font-medium">{fr ? "Membre" : "Member"}</label>
                    <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 flex items-center justify-between gap-2 text-left"
                        >
                          <span className={`truncate ${selectedMemberData ? "" : "text-muted-foreground"}`}>
                            {selectedMemberData ? `${selectedMemberData.name} (${selectedMemberData.id})` : (fr ? "Sélectionner un membre" : "Select a member")}
                          </span>
                          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            value={memberSearch}
                            onValueChange={setMemberSearch}
                            placeholder={fr ? "Rechercher par nom, email ou ID..." : "Search by name, email, or ID..."}
                          />
                          <CommandList>
                            <CommandEmpty>{fr ? "Aucun membre trouvé." : "No members found."}</CommandEmpty>
                            <CommandGroup>
                              {members.map((m) => (
                                <CommandItem
                                  key={m.id}
                                  value={`${m.name} ${m.email ?? ""} ${m.id}`}
                                  onSelect={() => {
                                    setSelectedMember(m.id);
                                    setMemberPopoverOpen(false);
                                    setMemberSearch("");
                                  }}
                                  className="flex items-start gap-2"
                                >
                                  <Check size={14} className={`mt-0.5 shrink-0 ${selectedMember === m.id ? "opacity-100 text-[#4CAF68]" : "opacity-0"}`} />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">{highlightMatch(m.name, memberSearch)}</span>
                                    {m.email && <span className="text-xs text-muted-foreground truncate">{highlightMatch(m.email, memberSearch)}</span>}
                                    <span className="text-xs text-muted-foreground truncate" style={{ fontFamily: "Geist Mono, monospace" }}>{highlightMatch(m.id, memberSearch)}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{fr ? "Type de compte" : "Account type"}</label>
                    <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                      {ACCOUNT_TYPES.map((a) => (
                        <option key={a.value} value={a.value}>{fr ? a.label : a.labelEn}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
                    {fr ? "Continuer" : "Continue"}
                  </button>
                </>
              )}

              {/* Step 2: Amount + Description */}
              {step === 2 && (
                <>
                  <div className="text-sm text-muted-foreground p-3 rounded-xl bg-muted">
                    <span className="font-medium text-foreground">{fr ? "Compte" : "Account"}: </span>
                    {fr ? ACCOUNT_TYPE_MAP[accountType] || "Courant" : accountType}
                  </div>
                  <div>
                    <label className="text-sm font-medium">{fr ? "Montant (XAF)" : "Amount (XAF)"}</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="100 000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{fr ? "Description" : "Description"}</label>
                    <input value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={tab === "deposit" ? (fr ? "Dépôt mensuel..." : "Monthly deposit...") : (fr ? "Retrait courant..." : "Regular withdrawal...")} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all">
                      {fr ? "Retour" : "Back"}
                    </button>
                    <button onClick={() => setStep(3)} disabled={!amount} className="flex-1 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all" style={{ background: "#4CAF68" }}>
                      {fr ? "Vérifier" : "Review"}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <>
                  <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{fr ? "Membre" : "Member"}</span>
                      <span className="font-medium">{members.find((m) => m.id === selectedMember)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{fr ? "Compte" : "Account"}</span>
                      <span className="font-medium">{fr ? ACCOUNT_TYPE_MAP[accountType] || "Courant" : accountType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{fr ? "Montant" : "Amount"}</span>
                      <span className="font-bold text-lg" style={{ fontFamily: "Geist Mono, monospace", color: tab === "deposit" ? "#4CAF68" : "#E5484D" }}>
                        {tab === "deposit" ? "+" : "−"}{formatXAF(Number(amount))}
                      </span>
                    </div>
                    {desc && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{fr ? "Description" : "Description"}</span>
                        <span className="font-medium text-right max-w-[200px] truncate">{desc}</span>
                      </div>
                    )}
                  </div>
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{submitError}</div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all">
                      {fr ? "Retour" : "Back"}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all" style={{ background: tab === "deposit" ? "#4CAF68" : "#E5484D" }}>
                      {submitting ? (fr ? "Enregistrement..." : "Recording...") : (fr ? "Confirmer" : "Confirm")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
