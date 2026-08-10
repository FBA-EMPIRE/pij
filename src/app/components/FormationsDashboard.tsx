import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Loader2, Plus } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { fetchFormations, saveFormation } from "../lib/supabase/queries";

export default function FormationsDashboard() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadAll = async () => {
    setLoading(true);
    try {
      setFormations(await fetchFormations());
    } catch (err: any) {
      setError(err?.message || "Failed to load formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = formations.filter((f: any) => {
    const matchesSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: formations.length,
    published: formations.filter((f: any) => f.status === "Published").length,
    draft: formations.filter((f: any) => f.status === "Draft").length,
    archived: formations.filter((f: any) => f.status === "Archived").length,
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
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Formations" : "Formation Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.total} {fr ? "au total" : "total"} · {counts.published} {fr ? "publiées" : "published"} · {counts.draft} {fr ? "brouillons" : "drafts"} · {counts.archived} {fr ? "archivées" : "archived"}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Créer une Formation" : "Create a Formation"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={fr ? "Rechercher par titre..." : "Search by title..."}
          className="flex-1 min-w-[200px] px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
          <option value="all">{fr ? "Tous les statuts" : "All statuses"}</option>
          <option value="Draft">{fr ? "Brouillon" : "Draft"}</option>
          <option value="Published">{fr ? "Publiée" : "Published"}</option>
          <option value="Archived">{fr ? "Archivée" : "Archived"}</option>
        </select>
      </div>

      {showCreate && (
        <FormationForm
          fr={fr}
          mode="create"
          onCancel={() => setShowCreate(false)}
          onError={setError}
          onSave={async (fields: any) => {
            await saveFormation(fields);
            await loadAll();
            setShowCreate(false);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">{fr ? "Aucune formation créée" : "No formations yet"}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {fr ? 'Cliquez sur "Créer une Formation" pour commencer.' : 'Click "Create a Formation" to get started.'}
          </p>
          {!showCreate && (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>
              {fr ? "Créer une Formation" : "Create a Formation"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((formation: any) => (
            <button
              key={formation.id}
              onClick={() => navigate(`/admin/formations/${formation.id}`)}
              className="text-left bg-card rounded-2xl border border-border p-5 hover:border-[#4CAF68]/40 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                  <BookOpen size={18} color="#4CAF68" />
                </div>
                <StatusBadge status={formation.status as any} size="sm" />
              </div>
              <h3 className="text-sm font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? formation.title : (formation.title_en || formation.title)}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{fr ? formation.description : (formation.description_en || formation.description)}</p>
              <p className="text-[10px] text-muted-foreground mt-3">{fr ? "Créée le" : "Created"} {formation.created_at?.slice(0, 10)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormationForm({ fr, mode, formation, onSave, onCancel, onError }: { fr: boolean; mode: "create" | "edit"; formation?: any; onSave: (f: any) => void; onCancel: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        try {
          await onSave({
            id: formation?.id,
            title: String(data.get("title") || ""),
            title_en: String(data.get("title_en") || data.get("title") || ""),
            description: String(data.get("description") || ""),
            description_en: String(data.get("description_en") || data.get("description") || ""),
            status: String(data.get("status") || "Draft"),
          });
        } catch (err: any) {
          onError(err?.message || "Failed to save formation");
        } finally {
          setSaving(false);
        }
      }}
      className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
        {mode === "create" ? (fr ? "Créer une formation" : "Create formation") : (fr ? "Modifier la formation" : "Edit formation")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{fr ? "Titre" : "Title"}</label>
          <input name="title" defaultValue={formation?.title} required className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
        </div>
        <div>
          <label className="text-sm font-medium">{fr ? "Titre anglais" : "English title"}</label>
          <input name="title_en" defaultValue={formation?.title_en} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={formation?.status ?? "Draft"} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
            <option value="Draft">{fr ? "Brouillon" : "Draft"}</option>
            <option value="Published">{fr ? "Publiée" : "Published"}</option>
            <option value="Archived">{fr ? "Archivée" : "Archived"}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea name="description" defaultValue={formation?.description} rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" />
      </div>
      <div>
        <label className="text-sm font-medium">{fr ? "Description anglaise" : "English description"}</label>
        <textarea name="description_en" defaultValue={formation?.description_en} rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>
          {saving ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Enregistrer" : "Save")}
        </button>
      </div>
    </form>
  );
}

export { FormationForm };
