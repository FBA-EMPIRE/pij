import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Archive, ArrowLeft, CheckCircle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";
import { FormationForm } from "./FormationsDashboard";
import CourseForm from "./formations/CourseForm";
import CourseCard from "./formations/CourseCard";
import ContentUpload from "./formations/ContentUpload";
import ContentItem from "./formations/ContentItem";
import ConsultationCard from "./formations/ConsultationCard";
import ConsultationResponse from "./formations/ConsultationResponse";
import { useAppContext } from "../context/AppContext";
import {
  formationsApi, coursesApi, contentsApi, consultationsApi,
  type Formation, type Course,
  type Content as ContentItemType, type Consultation,
} from "../lib/api/formations";

type TabKey = "courses" | "content" | "consultations" | "settings";
type FormMode = "create" | "edit" | null;

interface DetailState {
  formation: Formation;
  courses: Course[];
  contents: ContentItemType[];
  consultations: Consultation[];
}

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useAppContext();
  const fr = lang === "fr";
  // Mounted at both /admin/formations/:id (admins) and
  // /trainer/formations/:id (trainers) -- "back" must return to whichever
  // list page this instance was actually reached from.
  const basePath = location.pathname.startsWith("/trainer") ? "/trainer/formations" : "/admin/formations";

  const [tab, setTab] = useState<TabKey>("courses");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentCourseId, setContentCourseId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [data, setData] = useState<DetailState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // formations-get returns the formation with its courses -> content
      // nested directly (a formation is its own grouping, no category
      // layer); consultations aren't included there, so they're fetched
      // separately (also scoped to this formation server-side).
      const [formationRes, consultationsRes] = await Promise.all([
        formationsApi.get(id),
        consultationsApi.list({ formation_id: id, limit: 100 }),
      ]);
      if (!formationRes.success || !formationRes.data) throw new Error(formationRes.error || "Formation not found");
      if (!consultationsRes.success || !consultationsRes.data) throw new Error(consultationsRes.error || "Failed to load consultations");

      const formation = formationRes.data.formation;
      const courses = formation.formation_courses ?? [];
      const contents = courses.flatMap((c) => c.formation_content ?? []);

      setData({ formation, courses, contents, consultations: consultationsRes.data.consultations });
    } catch (err: any) {
      const message = err?.message || "Failed to load formation";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const openCreate = () => { setFormMode("create"); setEditingId(null); };
  const openEdit = (itemId: string) => { setFormMode("edit"); setEditingId(itemId); };
  const closeForm = () => { setFormMode(null); setEditingId(null); };
  const finishForm = async () => { await loadAll(); closeForm(); };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!data?.formation) {
    return (
      <div className="p-4 lg:p-6">
        <button onClick={() => navigate(basePath)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour aux Formations" : "Back to Formations"}
        </button>
        <p className="text-muted-foreground">{error || (fr ? "Formation introuvable" : "Formation not found")}</p>
      </div>
    );
  }

  const { formation, courses, contents, consultations } = data;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "courses", label: fr ? "Cours" : "Courses", count: courses.length },
    { key: "content", label: fr ? "Contenus" : "Content", count: contents.length },
    { key: "consultations", label: fr ? "Consultations" : "Consultations", count: consultations.length },
    { key: "settings", label: fr ? "Paramètres" : "Settings" },
  ];

  const handleSetStatus = async (status: "Draft" | "Published" | "Archived") => {
    setError("");
    try {
      const res = await formationsApi.update(formation.id, { status });
      if (!res.success) throw new Error(res.error || "Failed to update formation");
      toast.success(fr ? "Statut mis à jour" : "Status updated");
      await loadAll();
    } catch (err: any) {
      const message = err?.message || "Failed to update formation";
      setError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    setError("");
    try {
      const res = await formationsApi.remove(formation.id);
      if (!res.success) throw new Error(res.error || "Failed to delete formation");
      toast.success(fr ? "Formation supprimée" : "Formation deleted");
      navigate(basePath);
    } catch (err: any) {
      const message = err?.message || "Failed to delete formation";
      setError(message);
      toast.error(message);
      setConfirmingDelete(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await coursesApi.remove(courseId);
      if (!res.success) throw new Error(res.error || "Failed to delete course");
      toast.success(fr ? "Cours supprimé" : "Course deleted");
      await loadAll();
    } catch (err: any) {
      const message = err?.message || "Failed to delete course";
      setError(message);
      toast.error(message);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const res = await contentsApi.remove(contentId);
      if (!res.success) throw new Error(res.error || "Failed to delete content");
      toast.success(fr ? "Contenu supprimé" : "Content deleted");
      await loadAll();
    } catch (err: any) {
      const message = err?.message || "Failed to delete content";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <button onClick={() => navigate(basePath)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> {fr ? "Retour aux Formations" : "Back to Formations"}
      </button>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? formation.title : (formation.title_en || formation.title)}</h2>
            <StatusBadge status={formation.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">{fr ? formation.description : (formation.description_en || formation.description)}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={() => setTab("settings")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">
            <Pencil size={13} /> {fr ? "Modifier" : "Edit"}
          </button>
          {formation.status !== "Published" && (
            <button onClick={() => handleSetStatus("Published")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#4CAF68] text-[#4CAF68] text-xs">
              <CheckCircle size={13} /> {fr ? "Publier" : "Publish"}
            </button>
          )}
          {formation.status !== "Archived" && (
            <button onClick={() => handleSetStatus("Archived")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
              <Archive size={13} /> {fr ? "Archiver" : "Archive"}
            </button>
          )}
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{fr ? "Supprimer tout ?" : "Delete everything?"}</span>
              <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ background: "#E5484D" }}>{fr ? "Oui" : "Yes"}</button>
              <button onClick={() => setConfirmingDelete(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Non" : "No"}</button>
            </div>
          ) : (
            <button onClick={() => setConfirmingDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-[#E5484D] text-xs">
              <Trash2 size={13} /> {fr ? "Supprimer" : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border px-5 py-3 mb-6 text-sm text-muted-foreground">
        {courses.length} {fr ? "Cours" : "Courses"} · {contents.length} {fr ? "Contenus" : "Content"} · {consultations.length} {fr ? "Demandes" : "Requests"}
        {formation.is_paid && (
          <> · <span className="text-[#4CAF68] font-medium">{formation.price.toLocaleString(fr ? "fr-FR" : "en-US")} XAF</span></>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); closeForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.key ? "bg-white/20" : "bg-muted"}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab !== "consultations" && tab !== "settings" && !formMode && (
        <div className="flex justify-end items-center gap-2 mb-4 flex-wrap">
          {tab === "content" && courses.length > 0 && (
            <select
              value={contentCourseId ?? courses[0]?.id ?? ""}
              onChange={(e) => setContentCourseId(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
            >
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
          <button
            onClick={openCreate}
            disabled={tab === "content" && courses.length === 0}
            title={tab === "content" && courses.length === 0 ? (fr ? "Créez d'abord un cours" : "Create a course first") : undefined}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
            style={{ background: "#4CAF68" }}
          >
            <Plus size={16} />
            {tab === "courses" && (fr ? "Ajouter un cours" : "Add a course")}
            {tab === "content" && (fr ? "Ajouter un fichier" : "Add a file")}
          </button>
        </div>
      )}

      {formMode && tab === "courses" && (
        <CourseForm
          formationId={formation.id}
          mode={formMode}
          initialData={courses.find((c) => c.id === editingId)}
          onCancel={closeForm}
          onSuccess={finishForm}
        />
      )}
      {formMode === "create" && tab === "content" && (
        <ContentUpload
          courseId={contentCourseId ?? courses[0]?.id ?? ""}
          onCancel={closeForm}
          onSuccess={finishForm}
        />
      )}

      {tab === "courses" && (
        courses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucun cours créé pour cette formation" : "No courses created for this formation"}</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onEdit={() => openEdit(course.id)} onDelete={() => handleDeleteCourse(course.id)} />
            ))}
          </div>
        )
      )}
      {tab === "content" && (
        contents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucun contenu créé pour cette formation" : "No content created for this formation"}</p>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const items = contents.filter((c) => c.course_id === course.id);
              if (items.length === 0) return null;
              return (
                <div key={course.id}>
                  <h4 className="text-sm font-semibold mb-2">{course.title}</h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <ContentItem key={item.id} content={item} onDelete={() => handleDeleteContent(item.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      {tab === "consultations" && (
        <Consultations fr={fr} formationId={formation.id} consultations={consultations} onChanged={loadAll} />
      )}
      {tab === "settings" && (
        <FormationForm
          fr={fr}
          mode="edit"
          formation={formation}
          onCancel={() => setTab("courses")}
          onError={(msg: string) => { setError(msg); toast.error(msg); }}
          onSave={async (fields: any) => {
            const { id: fid, ...patch } = fields;
            const res = await formationsApi.update(fid, patch);
            if (!res.success) throw new Error(res.error || "Failed to update formation");
            toast.success(fr ? "Formation mise à jour" : "Formation updated");
            await loadAll();
          }}
        />
      )}
    </div>
  );
}

function Consultations({ fr, formationId, consultations, onChanged }: { fr: boolean; formationId: string; consultations: Consultation[]; onChanged: () => Promise<void> }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [respondId, setRespondId] = useState<string | null>(null);

  const counts = {
    pending: consultations.filter((c) => c.status === "pending").length,
    approved: consultations.filter((c) => c.status === "approved").length,
    completed: consultations.filter((c) => c.status === "completed").length,
  };
  const filtered = statusFilter === "all" ? consultations : consultations.filter((c) => c.status === statusFilter);

  if (consultations.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucune demande de consultation pour cette formation" : "No consultation requests for this formation"}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          {counts.pending} {fr ? "En attente" : "Pending"} · {counts.approved} {fr ? "Répondues" : "Responded"} · {counts.completed} {fr ? "Résolues" : "Resolved"}
        </p>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-input-background text-sm">
          <option value="all">{fr ? "Tous les statuts" : "All statuses"}</option>
          <option value="pending">{fr ? "En attente" : "Pending"}</option>
          <option value="approved">{fr ? "Répondu" : "Responded"}</option>
          <option value="completed">{fr ? "Résolu" : "Resolved"}</option>
          <option value="cancelled">{fr ? "Fermé" : "Closed"}</option>
        </select>
      </div>
      <div className="space-y-4">
        {filtered.map((request) => (
          <ConsultationCard key={request.id} consultation={request} onRespond={() => setRespondId(request.id)} />
        ))}
      </div>

      {respondId && (
        <ConsultationResponse
          consultationId={respondId}
          formationId={formationId}
          onCancel={() => setRespondId(null)}
          onSuccess={async () => { await onChanged(); setRespondId(null); }}
        />
      )}
    </div>
  );
}
