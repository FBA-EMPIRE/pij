import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Search, Download } from "lucide-react";
import { fetchTransactions, getCurrentUserId } from "../lib/supabase/queries";
import { formatXAF } from "../lib/format";
import TransactionDetailModal from "./TransactionDetailModal";
import type { Transaction } from "../types";
import { useAppContext } from "../context/AppContext";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [["Description", "Date", "Compte", "Montant", "Type"]];
      filtered.forEach((t) => {
        rows.push([t.description || "", t.date || t.created_at || "", t.account || t.account_type || "", String(t.amount ?? 0), (t.amount ?? 0) > 0 ? "Crédit" : "Débit"]);
      });
      const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  useEffect(() => {
    getCurrentUserId().then(async (uid) => {
      setCurrentUserId(uid);
      const txns = await fetchTransactions(uid);
      setTransactions(txns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const desc = t.description || "";
    const type = (t.type || t.transaction_type || "").toLowerCase();
    const matchSearch = desc.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Historique des transactions" : "Transaction history"}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{filtered.length} {fr ? "transactions" : "transactions"}</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto min-h-[44px] disabled:opacity-50">
          <Download size={15} /> <span className="sm:hidden">{exporting ? "..." : (fr ? "Exporter" : "Export")}</span><span className="hidden sm:inline">{exporting ? "..." : (fr ? "Exporter" : "Export")}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            placeholder={fr ? "Rechercher une transaction..." : "Search transactions..."}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: fr ? "Tout" : "All" },
            { value: "deposit", label: fr ? "Dépôts" : "Deposits" },
            { value: "withdrawal", label: fr ? "Retraits" : "Withdrawals" },
            { value: "tontine", label: "Tontine" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                typeFilter === f.value
                  ? "bg-[#4CAF68] text-white border-[#4CAF68]"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{fr ? "Aucune transaction trouvée" : "No transactions found"}</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
              <div className="col-span-1" />
              <div className="col-span-5">{fr ? "Description" : "Description"}</div>
              <div className="col-span-2">{fr ? "Date" : "Date"}</div>
              <div className="col-span-2">{fr ? "Compte" : "Account"}</div>
              <div className="col-span-2 text-right">{fr ? "Montant" : "Amount"}</div>
            </div>
            {filtered.map((txn) => {
              const desc = txn.description || "";
              const amount = txn.amount ?? 0;
              const date = txn.date || txn.created_at || "";
              const account = txn.account || txn.account_type || "";
              const isCredit = amount > 0;
              return (
                <button key={txn.id} onClick={() => setSelectedTxn(txn)} className="w-full text-left grid grid-cols-12 items-center gap-1 sm:gap-0 px-3 sm:px-5 py-3 sm:py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors min-h-[44px]">
                  <div className="col-span-1 flex justify-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
                      {isCredit ? <ArrowDownRight size={12} className="sm:w-[14px] sm:h-[14px]" color="#4CAF68" /> : <ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px]" color="#E5484D" />}
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-5 min-w-0 pr-1 sm:pr-4">
                    <p className="text-xs sm:text-sm font-medium truncate">{desc}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground sm:hidden mt-0.5">{date} · {account}</p>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-muted-foreground">{date}</p>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{account}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className={`text-xs sm:text-sm font-bold ${isCredit ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                      {isCredit ? "+" : "−"}{formatXAF(amount)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTxn && (
        <TransactionDetailModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}
