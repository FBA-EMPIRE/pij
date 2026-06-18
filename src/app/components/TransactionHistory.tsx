import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download } from "lucide-react";
import { TRANSACTIONS, formatXAF } from "./mockData";

interface TransactionHistoryProps {
  lang?: "fr" | "en";
}

export default function TransactionHistory({ lang = "fr" }: TransactionHistoryProps) {
  const fr = lang === "fr";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type.toLowerCase() === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Historique des transactions" : "Transaction history"}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{filtered.length} {fr ? "transactions" : "transactions"}</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto min-h-[44px]">
          <Download size={15} /> <span className="sm:hidden">{fr ? "Exporter" : "Export"}</span><span className="hidden sm:inline">{fr ? "Exporter" : "Export"}</span>
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
              const isCredit = txn.amount > 0;
              return (
                <div key={txn.id} className="grid grid-cols-12 items-center gap-1 sm:gap-0 px-3 sm:px-5 py-3 sm:py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="col-span-1 flex justify-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${isCredit ? "bg-[#E8F5EC]" : "bg-red-50"}`}>
                      {isCredit ? <ArrowDownRight size={12} className="sm:w-[14px] sm:h-[14px]" color="#4CAF68" /> : <ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px]" color="#E5484D" />}
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-5 min-w-0 pr-1 sm:pr-4">
                    <p className="text-xs sm:text-sm font-medium truncate">{txn.description}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground sm:hidden mt-0.5">{txn.date} · {txn.account}</p>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-muted-foreground">{txn.date}</p>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{txn.account}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className={`text-xs sm:text-sm font-bold ${isCredit ? "text-[#1F9D55]" : "text-[#E5484D]"}`} style={{ fontFamily: "Geist Mono, monospace" }}>
                      {isCredit ? "+" : "−"}{formatXAF(txn.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
