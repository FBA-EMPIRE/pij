import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, Eye, Edit, UserX } from "lucide-react";
import { MEMBERS, formatXAF } from "./mockData";
import { StatusBadge } from "./StatusBadge";

interface UserManagementProps {
  lang?: "fr" | "en";
}

export default function UserManagement({ lang = "fr" }: UserManagementProps) {
  const fr = lang === "fr";
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = MEMBERS.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.includes(search) || m.phone.includes(search);
    const matchKyc = kycFilter === "all" || m.kyc.toLowerCase() === kycFilter;
    return matchSearch && matchKyc;
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des membres" : "User management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} {fr ? "membres trouvés" : "members found"}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Ajouter un membre" : "Add member"}
        </button>
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
                <th className="px-5 py-3 text-left">{fr ? "Compte" : "Account"}</th>
                <th className="px-5 py-3 text-right">{fr ? "Épargne" : "Savings"}</th>
                <th className="px-5 py-3 text-right">{fr ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Geist Mono, monospace" }}>{m.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6E3A9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{m.phone}</td>
                  <td className="px-5 py-4"><StatusBadge status={m.kyc as any} size="sm" /></td>
                  <td className="px-5 py-4"><StatusBadge status={m.status as any} size="sm" /></td>
                  <td className="px-5 py-4 text-right text-sm font-medium whitespace-nowrap" style={{ fontFamily: "Geist Mono, monospace" }}>
                    {m.balance_savings > 0 ? formatXAF(m.balance_savings) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title={fr ? "Voir" : "View"}>
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title={fr ? "Modifier" : "Edit"}>
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-[#E5484D] hover:bg-red-50 transition-all" title={fr ? "Suspendre" : "Suspend"}>
                        <UserX size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
