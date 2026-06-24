import { useEffect, useState } from "react";
import { Search, Filter, Shield, Download } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
}

export default function AuditLogs() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .then(({ data }) => {
        if (data) setLogs(data as AuditLog[]);
      });
  }, []);

  const filtered = logs.filter((log) =>
    log.actor.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  const actionColor = (action: string) => {
    if (action.includes("Approved") || action.includes("Recorded")) return "#4CAF68";
    if (action.includes("Rejected") || action.includes("Deleted")) return "#E5484D";
    if (action.includes("Created") || action.includes("Assigned")) return "#6E3A9A";
    return "#6B7280";
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Logs d'audit" : "Audit Logs"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{fr ? "Journal immuable de toutes les actions système." : "Immutable log of all system actions."}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Download size={15} /> {fr ? "Exporter" : "Export"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 max-w-md"
          placeholder={fr ? "Rechercher par acteur, action, entité..." : "Search by actor, action, entity..."}
        />
      </div>

      {/* Log table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                <th className="px-5 py-3 text-left">{fr ? "Acteur" : "Actor"}</th>
                <th className="px-5 py-3 text-left">{fr ? "Action" : "Action"}</th>
                <th className="px-5 py-3 text-left">{fr ? "Entité" : "Entity"}</th>
                <th className="px-5 py-3 text-left">{fr ? "Horodatage" : "Timestamp"}</th>
                <th className="px-5 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#6E3A9A]/10 flex items-center justify-center shrink-0">
                        <Shield size={13} color="#6E3A9A" />
                      </div>
                      <span className="text-sm font-medium">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium" style={{ color: actionColor(log.action) }}>{log.action}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{log.entity}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Geist Mono, monospace" }}>
                      {new Date(log.timestamp).toLocaleString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{log.ip}</code>
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
