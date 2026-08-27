import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, BookOpen, CheckCircle, FileText, Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { formationsApi, type Formation } from "../lib/api/formations";
import { trainerService, type PendingFormateurRequest } from "../lib/api/trainers";
import TrainerRequestDetailModal from "./modals/TrainerRequestDetailModal";

export default function FormationsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, userProfile } = useAppContext();
  const fr = lang === "fr";
  const isFormateur = userProfile?.role === "formateur";
  // Formateurs review no one's application but their own promotion --
  // the requests tab is admin/super_admin territory only.
  const canReviewRequests = !isFormateur;
  // Mounted at both /admin/formations (admins) and /trainer/formations
  // (trainers, who never see the admin portal at all) -- link targets
  // must follow whichever base the page is actually running under.
  const basePath = location.pathname.startsWith("/trainer") ? "/trainer/formations" : "/admin/formations";
  const [tab, setTab] = useState<"formations" | "requests">("formations");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Trainers only ever manage what they created; admins/super_admins see everything.
      const res = await formationsApi.list({
        trainer_id: isFormateur ? userProfile?.id : undefined,
        limit: 100,
      });
      if (!res.success || !res.data) throw new Error(res.error || "Failed to load formations");
      setFormations(res.data.formations);
    } catch (err: any) {
      const message = err?.message || "Failed to load formations";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await formationsApi.remove(id);
      if (!res.success) throw new Error(res.error || "Failed to delete formation");
      toast.success(fr ? "Formation supprimée" : "Formation deleted");
      await loadAll();
    } catch (err: any) {
      const message = err?.message || "Failed to delete formation";
      setError(message);
      toast.error(message);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filtered = formations.filter((f: any) => {
    const matchesSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: formations.length,
    published: formations.filter((f: any) => f.status === "Published").length,
    draft: formations.filter((f: any) => f.status === "Draft").length,
  };

  if (loading && tab === "formations") {
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
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
          {isFormateur ? (fr ? "Mes Formations" : "My Formations") : (fr ? "Gestion des Formations" : "Formation Management")}
        </h2>
        {tab === "formations" && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
            <Plus size={16} /> {fr ? "Créer une formation" : "Create a formation"}
          </button>
        )}
      </div>

      {canReviewRequests && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("formations")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "formations" ? "bg-[#4CAF68] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {fr ? "Formations" : "Formations"}
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "requests" ? "bg-[#4CAF68] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {fr ? "Candidatures Formateur" : "Trainer Requests"}
          </button>
        </div>
      )}

      {tab === "requests" && canReviewRequests ? (
        <TrainerRequestsTab fr={fr} />
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: fr ? "Total formations" : "Total formations", value: counts.total, icon: BookOpen },
          { label: fr ? "Publiées" : "Published", value: counts.published, icon: CheckCircle },
          { label: fr ? "Brouillons" : "Drafts", value: counts.draft, icon: FileText },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
              <s.icon size={18} color="#4CAF68" />
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{s.value}</p>
          </div>
        ))}
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
          onError={(msg: string) => { setError(msg); toast.error(msg); }}
          onSave={async (fields: any) => {
            const res = await formationsApi.create(fields);
            if (!res.success) throw new Error(res.error || "Failed to create formation");
            toast.success(fr ? "Formation créée" : "Formation created");
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
            {fr ? 'Cliquez sur "Créer une formation" pour commencer.' : 'Click "Create a formation" to get started.'}
          </p>
          {!showCreate && (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>
              {fr ? "Créer une formation" : "Create a formation"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((formation: any) => (
            <div key={formation.id} className="bg-card rounded-2xl border border-border p-5 hover:border-[#4CAF68]/40 transition-all">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                  <BookOpen size={18} color="#4CAF68" />
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={formation.status as any} size="sm" />
                  {confirmDeleteId === formation.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(formation.id)} className="text-[10px] px-1.5 py-1 rounded-md text-white font-medium" style={{ background: "#E5484D" }}>
                        {fr ? "Oui" : "Yes"}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] px-1.5 py-1 rounded-md border border-border">
                        {fr ? "Non" : "No"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(formation.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label={fr ? "Supprimer" : "Delete"}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => navigate(`${basePath}/${formation.id}`)} className="text-left w-full">
                <h3 className="text-sm font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? formation.title : (formation.title_en || formation.title)}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{fr ? formation.description : (formation.description_en || formation.description)}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground">{fr ? "Créée le" : "Created"} {formation.created_at?.slice(0, 10)}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <BookOpen size={10} /> {formation.course_count ?? 0} {fr ? "cours" : "courses"}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

function TrainerRequestsTab({ fr }: { fr: boolean }) {
  const [requests, setRequests] = useState<PendingFormateurRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingFormateurRequest | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await trainerService.listPendingRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error(err?.message || (fr ? "Échec du chargement des candidatures" : "Failed to load trainer requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDone = () => {
    setSelected(null);
    toast.success(fr ? "Candidature traitée" : "Application processed");
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <>
      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <UserPlus size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">{fr ? "Aucune candidature en attente" : "No pending applications"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map((r) => {
            const name = r.applicant_name
              || [r.users?.profiles?.first_name, r.users?.profiles?.last_name].filter(Boolean).join(" ")
              || r.users?.email || "—";
            return (
              <button key={r.id} onClick={() => setSelected(r)} className="text-left bg-card rounded-2xl border border-border p-5 hover:border-[#4CAF68]/40 transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F0E8FF] dark:bg-[#2A1B3D] flex items-center justify-center shrink-0">
                    <UserPlus size={18} color="#6E3A9A" />
                  </div>
                  <StatusBadge status={r.status as any} size="sm" />
                </div>
                <h3 className="text-sm font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>{name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{r.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground">{r.created_at.split("T")[0]}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <FileText size={10} /> {r.formateur_request_documents?.length ?? 0} {fr ? "documents" : "documents"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <TrainerRequestDetailModal request={selected} onClose={() => setSelected(null)} onDone={handleDone} />
      )}
    </>
  );
}

function FormationForm({ fr, mode, formation, onSave, onCancel, onError }: { fr: boolean; mode: "create" | "edit"; formation?: any; onSave: (f: any) => void; onCancel: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [isPaid, setIsPaid] = useState(!!formation?.is_paid);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        try {
          const price = Number(data.get("price") || 0);
          if (isPaid && !(price > 0)) {
            throw new Error(fr ? "Le prix doit être supérieur à 0 pour une formation payante." : "Price must be greater than 0 for a paid formation.");
          }
          await onSave({
            id: formation?.id,
            title: String(data.get("title") || ""),
            title_en: String(data.get("title_en") || data.get("title") || ""),
            description: String(data.get("description") || ""),
            description_en: String(data.get("description_en") || data.get("description") || ""),
            status: String(data.get("status") || "Draft"),
            is_paid: isPaid,
            price: isPaid ? price : 0,
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
        <div>
          <label className="text-sm font-medium">{fr ? "Prix (XAF)" : "Price (XAF)"}</label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            disabled={!isPaid}
            defaultValue={formation?.price ?? 0}
            className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 disabled:opacity-50"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="rounded border-border accent-[#4CAF68]" />
        {fr ? "Formation payante" : "Paid formation"}
      </label>
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
