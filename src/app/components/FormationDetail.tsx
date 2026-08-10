import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Archive, ArrowLeft, BookOpen, CheckCircle, FileText, Loader2, Pencil, Plus, Trash2, Upload, Video, Link as LinkIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FormationForm } from "./FormationsDashboard";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import {
  fetchFormationDetail, saveFormation, deleteFormation,
  saveFormationCategory, deleteFormationCategory,
  saveFormationCourse, deleteFormationCourse,
  saveFormationContent, deleteFormationContent,
  uploadFormationAsset,
} from "../lib/supabase/queries";

type TabKey = "categories" | "courses" | "content" | "consultations";
type FormMode = "create" | "edit" | null;

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  const [tab, setTab] = useState<TabKey>("categories");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFormation, setEditingFormation] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [data, setData] = useState<{ formation: any; categories: any[]; courses: any[]; contents: any[]; consultations: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      setData(await fetchFormationDetail(id));
    } catch (err: any) {
      setError(err?.message || "Failed to load formation");
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
        <button onClick={() => navigate("/admin/formations")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> {fr ? "Retour aux Formations" : "Back to Formations"}
        </button>
        <p className="text-muted-foreground">{fr ? "Formation introuvable" : "Formation not found"}</p>
      </div>
    );
  }

  const { formation, categories, courses, contents, consultations } = data;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "categories", label: fr ? "Catégories" : "Categories", count: categories.length },
    { key: "courses", label: fr ? "Cours" : "Courses", count: courses.length },
    { key: "content", label: fr ? "Contenus" : "Content", count: contents.length },
    { key: "consultations", label: fr ? "Consultations" : "Consultations", count: consultations.length },
  ];

  const handleSetStatus = async (status: string) => {
    setError("");
    try { await saveFormation({ id: formation.id, status }); await loadAll(); }
    catch (err: any) { setError(err?.message || "Failed to update formation"); }
  };

  const handleDelete = async () => {
    setError("");
    try {
      await deleteFormation(formation.id);
      navigate("/admin/formations");
    } catch (err: any) {
      setError(err?.message || "Failed to delete formation");
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <button onClick={() => navigate("/admin/formations")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
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
          <button onClick={() => setEditingFormation(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">
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

      {editingFormation && (
        <FormationForm
          fr={fr}
          mode="edit"
          formation={formation}
          onCancel={() => setEditingFormation(false)}
          onError={setError}
          onSave={async (fields: any) => {
            await saveFormation(fields);
            await loadAll();
            setEditingFormation(false);
          }}
        />
      )}

      <div className="bg-card rounded-2xl border border-border px-5 py-3 mb-6 text-sm text-muted-foreground">
        {categories.length} {fr ? "Catégories" : "Categories"} · {courses.length} {fr ? "Cours" : "Courses"} · {contents.length} {fr ? "Contenus" : "Content"} · {consultations.length} {fr ? "Demandes" : "Requests"}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); closeForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.key ? "bg-white/20" : "bg-muted"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab !== "consultations" && !formMode && (
        <div className="flex justify-end mb-4">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>
            <Plus size={16} />
            {tab === "categories" && (fr ? "Ajouter une Catégorie" : "Add a Category")}
            {tab === "courses" && (fr ? "Ajouter un Cours" : "Add a Course")}
            {tab === "content" && (fr ? "Ajouter un Contenu" : "Add Content")}
          </button>
        </div>
      )}

      {formMode && tab === "categories" && (
        <CategoryForm
          fr={fr}
          mode={formMode}
          formationId={formation.id}
          category={categories.find((c) => c.id === editingId)}
          onCancel={closeForm}
          onError={setError}
          onSave={async (fields: any) => { await saveFormationCategory(fields); await loadAll(); closeForm(); }}
        />
      )}
      {formMode && tab === "courses" && (
        <CourseForm
          fr={fr}
          mode={formMode}
          course={courses.find((c) => c.id === editingId)}
          categories={categories}
          onCancel={closeForm}
          onError={setError}
          onSave={async (fields: any) => { await saveFormationCourse(fields); await loadAll(); closeForm(); }}
        />
      )}
      {formMode && tab === "content" && (
        <ContentForm
          fr={fr}
          mode={formMode}
          item={contents.find((c) => c.id === editingId)}
          courses={courses}
          onCancel={closeForm}
          onError={setError}
          onSave={async (fields: any) => { await saveFormationContent(fields); await loadAll(); closeForm(); }}
        />
      )}

      {tab === "categories" && (
        <Categories
          fr={fr}
          categories={categories}
          courses={courses}
          onEdit={openEdit}
          onDelete={async (itemId: string) => {
            try { await deleteFormationCategory(itemId); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete category"); }
          }}
        />
      )}
      {tab === "courses" && (
        <Courses
          fr={fr}
          courses={courses}
          categories={categories}
          onEdit={openEdit}
          onDelete={async (itemId: string) => {
            try { await deleteFormationCourse(itemId); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete course"); }
          }}
        />
      )}
      {tab === "content" && (
        <Content
          fr={fr}
          contents={contents}
          courses={courses}
          onEdit={openEdit}
          onDelete={async (itemId: string) => {
            try { await deleteFormationContent(itemId); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete content"); }
          }}
        />
      )}
      {tab === "consultations" && (
        <Consultations
          fr={fr}
          consultations={consultations}
          onUpdate={async (itemId: string, fields: Record<string, unknown>) => {
            try {
              const { error: updErr } = await supabase.from("consultation_requests").update(fields).eq("id", itemId);
              if (updErr) throw updErr;
              await loadAll();
            } catch (err: any) { setError(err?.message || "Failed to update request"); }
          }}
        />
      )}
    </div>
  );
}

function Categories({ fr, categories, courses, onEdit, onDelete }: { fr: boolean; categories: any[]; courses: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucune catégorie créée pour cette formation" : "No categories created for this formation"}</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {categories.map((cat: any) => {
        const courseCount = courses.filter((c: any) => c.category_id === cat.id).length;
        return (
          <div key={cat.id} className="bg-card rounded-2xl border border-border p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}>
              <BookOpen size={18} color={cat.color} />
            </div>
            <h3 className="text-sm font-semibold">{fr ? cat.name : (cat.name_en || cat.name)}</h3>
            <p className="text-xs text-muted-foreground mt-2">{cat.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{courseCount} {fr ? "cours" : "courses"}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => onEdit(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button>
              <button onClick={() => onDelete(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Courses({ fr, courses, categories, onEdit, onDelete }: { fr: boolean; courses: any[]; categories: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  if (courses.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucun cours créé pour cette formation" : "No courses created for this formation"}</p>;
  }
  return (
    <div className="space-y-6">
      {categories.map((cat: any) => {
        const catCourses = courses.filter((c: any) => c.category_id === cat.id);
        if (catCourses.length === 0) return null;
        return (
          <div key={cat.id}>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <BookOpen size={14} style={{ color: cat.color }} /> {fr ? cat.name : (cat.name_en || cat.name)}
            </h4>
            <div className="space-y-3">
              {catCourses.map((course: any) => (
                <div key={course.id} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{course.title}</h3>
                        <StatusBadge status={course.status as any} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{fr ? "Durée" : "Duration"}: {course.duration}</p>
                      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{course.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button onClick={() => onEdit(course.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button>
                      <button onClick={() => onDelete(course.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Content({ fr, contents, courses, onEdit, onDelete }: { fr: boolean; contents: any[]; courses: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const icon = (type: string) => (type === "video" ? Video : type === "external_link" ? LinkIcon : FileText);
  if (contents.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucun contenu créé pour cette formation" : "No content created for this formation"}</p>;
  }
  return (
    <div className="space-y-6">
      {courses.map((course: any) => {
        const items = contents.filter((c: any) => c.course_id === course.id);
        if (items.length === 0) return null;
        return (
          <div key={course.id}>
            <h4 className="text-sm font-semibold mb-2">{course.title}</h4>
            <div className="space-y-2">
              {items.map((item: any) => {
                const Icon = icon(item.type);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                      <Icon size={16} color="#4CAF68" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.format} · {item.duration}</p>
                    </div>
                    <button onClick={() => onEdit(item.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs shrink-0">{fr ? "Modifier" : "Edit"}</button>
                    <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] shrink-0">{fr ? "Supprimer" : "Delete"}</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Consultations({ fr, consultations, onUpdate }: { fr: boolean; consultations: any[]; onUpdate: (id: string, fields: Record<string, unknown>) => void }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteDraftId, setNoteDraftId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const counts = {
    pending: consultations.filter((c: any) => c.status === "pending").length,
    approved: consultations.filter((c: any) => c.status === "approved").length,
    completed: consultations.filter((c: any) => c.status === "completed").length,
  };
  const filtered = statusFilter === "all" ? consultations : consultations.filter((c: any) => c.status === statusFilter);

  if (consultations.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucune demande de consultation pour cette formation" : "No consultation requests for this formation"}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          {counts.pending} {fr ? "En attente" : "Pending"} · {counts.approved} {fr ? "Approuvées" : "Approved"} · {counts.completed} {fr ? "Complétées" : "Completed"}
        </p>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-input-background text-sm">
          <option value="all">{fr ? "Tous les statuts" : "All statuses"}</option>
          <option value="pending">{fr ? "En attente" : "Pending"}</option>
          <option value="approved">{fr ? "Approuvée" : "Approved"}</option>
          <option value="completed">{fr ? "Complétée" : "Completed"}</option>
          <option value="cancelled">{fr ? "Annulée" : "Cancelled"}</option>
        </select>
      </div>
      <div className="space-y-4">
        {filtered.map((request: any) => {
          const profile = request.users?.profiles;
          const memberName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : (request.users?.email ?? "—");
          return (
            <div key={request.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold">{memberName}</h3>
                    <StatusBadge status={(request.status ?? "pending") as any} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">{request.users?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fr ? "Demandé le" : "Requested"}: {request.created_at?.slice(0, 10)}</p>
                  {request.course && (
                    <p className="text-xs text-[#6E3A9A] mt-0.5">{fr ? "Concernant" : "Regarding"}: {fr ? request.course.title : (request.course.title_en || request.course.title)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{request.need}</p>
                  {request.admin_notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{fr ? "Note" : "Note"}: {request.admin_notes}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {request.status === "pending" && (
                    <>
                      <button onClick={() => onUpdate(request.id, { status: "approved" })} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Approuver" : "Approve"}</button>
                      <button onClick={() => onUpdate(request.id, { status: "cancelled" })} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-[#E5484D] text-xs">{fr ? "Rejeter" : "Reject"}</button>
                    </>
                  )}
                  {request.status === "approved" && (
                    <>
                      <button onClick={() => onUpdate(request.id, { status: "completed" })} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Compléter" : "Complete"}</button>
                      <button onClick={() => onUpdate(request.id, { status: "cancelled" })} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">{fr ? "Annuler" : "Cancel"}</button>
                    </>
                  )}
                  <button onClick={() => { setNoteDraftId(request.id); setNoteText(request.admin_notes ?? ""); }} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Ajouter Note" : "Add Note"}</button>
                </div>
              </div>
              {noteDraftId === request.id && (
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <input value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-border bg-input-background text-sm" placeholder={fr ? "Note interne..." : "Internal note..."} />
                  <div className="flex gap-2">
                    <button onClick={() => { onUpdate(request.id, { admin_notes: noteText }); setNoteDraftId(null); }} className="px-3 py-2 rounded-xl text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Enregistrer" : "Save"}</button>
                    <button onClick={() => setNoteDraftId(null)} className="px-3 py-2 rounded-xl border border-border text-xs">{fr ? "Annuler" : "Cancel"}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryForm({ fr, mode, formationId, category, onSave, onCancel, onError }: { fr: boolean; mode: Exclude<FormMode, null>; formationId: string; category?: any; onSave: (c: any) => void; onCancel: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        try {
          await onSave({
            id: category?.id,
            formation_id: formationId,
            name: String(data.get("name") || ""),
            name_en: String(data.get("name_en") || data.get("name") || ""),
            description: String(data.get("description") || ""),
            color: String(data.get("color") || "#4CAF68"),
            status: "Active",
          });
        } catch (err: any) {
          onError(err?.message || "Failed to save category");
        } finally {
          setSaving(false);
        }
      }}
      className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{mode === "create" ? (fr ? "Créer une catégorie" : "Create category") : (fr ? "Modifier la catégorie" : "Edit category")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="name" label={fr ? "Nom" : "Name"} defaultValue={category?.name} />
        <Field name="name_en" label={fr ? "Nom anglais" : "English name"} defaultValue={category?.name_en} />
        <Field name="color" label={fr ? "Couleur" : "Color"} defaultValue={category?.color ?? "#4CAF68"} />
        <Field name="description" label="Description" defaultValue={category?.description} />
      </div>
      <FormActions fr={fr} onCancel={onCancel} saving={saving} />
    </form>
  );
}

function CourseForm({ fr, mode, course, categories, onSave, onCancel, onError }: { fr: boolean; mode: Exclude<FormMode, null>; course?: any; categories: any[]; onSave: (c: any) => void; onCancel: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        try {
          let coverImagePath = course?.cover_image_path;
          if (coverFile) coverImagePath = await uploadFormationAsset(coverFile, "covers");
          await onSave({
            id: course?.id,
            category_id: String(data.get("category_id") || categories[0]?.id || null) || null,
            title: String(data.get("title") || ""),
            title_en: String(data.get("title_en") || data.get("title") || ""),
            description: String(data.get("description") || ""),
            instructor: String(data.get("instructor") || ""),
            duration: String(data.get("duration") || "1h"),
            lesson_count: Number(data.get("lesson_count") || 1),
            level: String(data.get("level") || "Débutant"),
            status: String(data.get("status") || "Draft"),
            featured: data.get("featured") === "on",
            cover_image_path: coverImagePath,
            image: course?.image ?? "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)",
          });
        } catch (err: any) {
          onError(err?.message || "Failed to save course");
        } finally {
          setSaving(false);
        }
      }}
      className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{mode === "create" ? (fr ? "Créer un cours" : "Create course") : (fr ? "Modifier le cours" : "Edit course")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="title" label={fr ? "Titre" : "Title"} defaultValue={course?.title} />
        <Field name="title_en" label={fr ? "Titre anglais" : "English title"} defaultValue={course?.title_en} />
        <SelectField name="category_id" label={fr ? "Catégorie" : "Category"} defaultValue={course?.category_id} options={categories.map((c: any) => ({ value: c.id, label: c.name }))} />
        <Field name="instructor" label={fr ? "Formateur" : "Instructor"} defaultValue={course?.instructor} />
        <Field name="duration" label={fr ? "Durée" : "Duration"} defaultValue={course?.duration} />
        <Field name="lesson_count" label={fr ? "Nombre de leçons" : "Lessons"} type="number" defaultValue={String(course?.lesson_count ?? 1)} />
        <Field name="level" label={fr ? "Niveau" : "Level"} defaultValue={course?.level} />
        <SelectField name="status" label="Status" defaultValue={course?.status} options={["Draft", "Published", "Archived"].map((s) => ({ value: s, label: s }))} />
      </div>
      <TextareaField name="description" label={fr ? "Description" : "Description"} defaultValue={course?.description} />
      <div>
        <label className="text-sm font-medium flex items-center gap-2"><Upload size={14} /> {fr ? "Image de couverture" : "Cover image"}</label>
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F5EC] dark:file:bg-[#1A3326] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#1F9D55] dark:file:text-[#4CAF68]" />
        {course?.cover_image_path && !coverFile && <p className="text-xs text-muted-foreground mt-1">{fr ? "Image actuelle définie" : "Current cover image is set"}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={course?.featured} className="rounded border-border accent-[#4CAF68]" />
        {fr ? "Mettre en avant" : "Featured"}
      </label>
      <FormActions fr={fr} onCancel={onCancel} saving={saving} />
    </form>
  );
}

function ContentForm({ fr, mode, item, courses, onSave, onCancel, onError }: { fr: boolean; mode: Exclude<FormMode, null>; item?: any; courses: any[]; onSave: (c: any) => void; onCancel: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(item?.type ?? "video");
  const [file, setFile] = useState<File | null>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        try {
          let storagePath = item?.storage_path;
          let fileName = item?.file_name;
          let fileSize = item?.file_size;
          if (file && (type === "video" || type === "pdf")) {
            storagePath = await uploadFormationAsset(file, "content");
            fileName = file.name;
            fileSize = formatFileSize(file.size);
          }
          await onSave({
            id: item?.id,
            course_id: String(data.get("course_id") || courses[0]?.id || ""),
            type,
            title: String(data.get("title") || ""),
            duration: String(data.get("duration") || "10 min"),
            format: type === "video" ? "MP4" : type === "pdf" ? "PDF" : "Link",
            file_name: fileName ?? null,
            file_size: fileSize ?? null,
            storage_path: type === "external_link" ? null : (storagePath ?? null),
            external_url: type === "external_link" ? String(data.get("external_url") || "") : null,
          });
        } catch (err: any) {
          onError(err?.message || "Failed to save content");
        } finally {
          setSaving(false);
        }
      }}
      className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{mode === "create" ? (fr ? "Ajouter un contenu" : "Add content") : (fr ? "Modifier le contenu" : "Edit content")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField name="course_id" label={fr ? "Cours lié" : "Linked course"} defaultValue={item?.course_id} options={courses.map((c: any) => ({ value: c.id, label: c.title }))} />
        <div>
          <label className="text-sm font-medium">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
            <option value="video">{fr ? "Vidéo" : "Video"}</option>
            <option value="pdf">PDF</option>
            <option value="external_link">{fr ? "Lien externe" : "External link"}</option>
          </select>
        </div>
        <Field name="title" label={fr ? "Titre" : "Title"} defaultValue={item?.title} />
        <Field name="duration" label={fr ? "Durée / taille" : "Duration / size"} defaultValue={item?.duration} />
      </div>
      {type === "external_link" ? (
        <Field name="external_url" label={fr ? "URL externe" : "External URL"} defaultValue={item?.external_url} />
      ) : (
        <div>
          <label className="text-sm font-medium flex items-center gap-2"><Upload size={14} /> {fr ? `Fichier (${type === "video" ? "MP4" : "PDF"})` : `File (${type === "video" ? "MP4" : "PDF"})`}</label>
          <input
            type="file"
            accept={type === "video" ? "video/mp4,video/webm" : "application/pdf"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F5EC] dark:file:bg-[#1A3326] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#1F9D55] dark:file:text-[#4CAF68]"
          />
          {item?.file_name && !file && <p className="text-xs text-muted-foreground mt-1">{fr ? "Fichier actuel" : "Current file"}: {item.file_name}</p>}
        </div>
      )}
      <FormActions fr={fr} onCancel={onCancel} saving={saving} />
    </form>
  );
}

function Field({ name, label, defaultValue = "", type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
    </div>
  );
}

function TextareaField({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={4} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" />
    </div>
  );
}

function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select name={name} defaultValue={defaultValue ?? options[0]?.value} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function FormActions({ fr, onCancel, saving }: { fr: boolean; onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button>
      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>
        {saving ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Enregistrer" : "Save")}
      </button>
    </div>
  );
}
