import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Archive, Eye, Loader2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { formatXAF } from "../lib/format";

export default function AdminTontineArchives() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from("tontines")
        .select("*, tontine_types(name, contribution_amount)")
        .eq("status", "closed");
      if (err) { setError(true); setLoading(false); return; }
      setArchives(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
      </button>

      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Archives des tontines" : "Tontine archives"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{archives.length} {fr ? "tontine(s) archivée(s)" : "archived tontine(s)"}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : error ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-red-500">{fr ? "Erreur de chargement des archives" : "Error loading archives"}</p>
        </div>
      ) : archives.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Archive size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{fr ? "Aucune tontine archivée" : "No archived tontines"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archives.map((arc) => {
            const contribution = arc.tontine_types?.contribution_amount ?? 0;
            return (
            <div key={arc.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{arc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{arc.tontine_types?.name ?? ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/tontines/archives/${arc.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye size={13} /> {fr ? "Voir" : "View"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Capacité" : "Capacity"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.capacity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Début" : "Start"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.start_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Cotisation" : "Contribution"}</p>
                  <p className="text-sm font-bold mt-0.5 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(contribution)}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
