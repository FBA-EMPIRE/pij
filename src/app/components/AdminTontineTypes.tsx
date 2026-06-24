import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import { fetchTontineTypes } from "../lib/supabase/queries";
import { useAppContext } from "../context/AppContext";

export default function AdminTontineTypes() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTontineTypes();
        setTypes(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <p className="text-red-500">{fr ? "Erreur de chargement" : "Error loading tontine types"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Types de Tontine" : "Tontine Types"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Gérez les types de tontine disponibles sur la plateforme." : "Manage tontine types available on the platform."}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <span>{fr ? "NOM" : "NAME"}</span>
          <span>{fr ? "FRÉQUENCE" : "FREQUENCY"}</span>
          <span>{fr ? "COTISATION" : "CONTRIBUTION"}</span>
          <span>{fr ? "PLACES" : "CAPACITY"}</span>
          <span>STATUS</span>
        </div>
        <div className="divide-y divide-border">
          {types.map((t: any) => (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 items-center">
              <div>
                <p className="text-sm font-semibold">{fr ? t.name : t.nameEn || t.name}</p>
                <p className="text-xs text-muted-foreground truncate">{fr ? t.description : t.descriptionEn || t.description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {t.frequency === "weekly" ? (fr ? "Hebdo" : "Weekly") : t.frequency === "biweekly" ? (fr ? "Bihebdo" : "Biweekly") : t.frequency === "monthly" ? (fr ? "Mensuel" : "Monthly") : t.frequency}
              </div>
              <div className="text-sm font-mono">{t.default_contribution?.toLocaleString() || t.defaultContribution?.toLocaleString() || "—"} XAF</div>
              <div className="text-sm">{t.default_capacity || t.defaultCapacity || "—"}</div>
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${t.status === "Active" || t.status === "active" ? "bg-[#E8F5EC] text-[#1F9D55]" : "bg-red-50 text-[#E5484D]"}`}>
                  {t.status === "Active" || t.status === "active" ? (fr ? "Actif" : "Active") : (fr ? "Inactif" : "Inactive")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
