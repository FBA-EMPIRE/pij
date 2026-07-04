import { useEffect, useState } from "react";
import { Archive, BookOpen, FileText, Plus, Video, Link as LinkIcon, Upload, Loader2, CheckCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import {
  fetchFormationCategories, saveFormationCategory, deleteFormationCategory,
  fetchFormationCourses, saveFormationCourse, deleteFormationCourse,
  fetchFormationContent, saveFormationContent, deleteFormationContent,
  uploadFormationAsset,
} from "../lib/supabase/queries";

const CATEGORY_OPTIONS = [
  { value: "entrepreneurship", label: { fr: "Entrepreneuriat", en: "Entrepreneurship" } },
  { value: "finance", label: { fr: "Finance", en: "Finance" } },
  { value: "agriculture", label: { fr: "Agriculture", en: "Agriculture" } },
  { value: "digital_skills", label: { fr: "Compétences numériques", en: "Digital Skills" } },
  { value: "business", label: { fr: "Business", en: "Business" } },
  { value: "investment", label: { fr: "Investissement", en: "Investment" } },
];

type TabKey = "categories" | "courses" | "content" | "consultations";
type FormMode = "create" | "edit" | null;

export default function AdminFormations() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [tab, setTab] = useState<TabKey>("courses");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, crs, conts, { data: consults }] = await Promise.all([
        fetchFormationCategories(),
        fetchFormationCourses(),
        fetchFormationContent(),
        supabase.from("consultation_requests").select("*, users(email, profiles(first_name, last_name))"),
      ]);
      setCategories(cats);
      setCourses(crs);
      setContents(conts);
      setConsultations(consults ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load formations data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "categories", label: fr ? "Catégories" : "Categories" },
    { key: "courses", label: fr ? "Cours" : "Courses" },
    { key: "content", label: fr ? "Contenus" : "Content" },
    { key: "consultations", label: fr ? "Consultations" : "Consultations" },
  ];

  const openCreate = () => { setFormMode("create"); setEditingId(null); };
  const openEdit = (id: string) => { setFormMode("edit"); setEditingId(id); };
  const closeForm = () => { setFormMode(null); setEditingId(null); };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Formations" : "Formation Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} {fr ? "cours" : "courses"} · {consultations.length} {fr ? "demandes" : "requests"}
          </p>
        </div>
        {tab !== "consultations" && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
            <Plus size={16} /> {fr ? "Créer" : "Create"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); closeForm(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {formMode && tab === "categories" && (
        <CategoryForm
          fr={fr}
          mode={formMode}
          category={categories.find((c) => c.id === editingId)}
          onCancel={closeForm}
          onError={setError}
          onSave={async (fields: any) => {
            await saveFormationCategory(fields);
            await loadAll();
            closeForm();
          }}
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
          onSave={async (fields: any) => {
            await saveFormationCourse(fields);
            await loadAll();
            closeForm();
          }}
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
          onSave={async (fields: any) => {
            await saveFormationContent(fields);
            await loadAll();
            closeForm();
          }}
        />
      )}

      {tab === "categories" && (
        <Categories
          fr={fr}
          categories={categories}
          onEdit={openEdit}
          onDelete={async (id: string) => {
            try { await deleteFormationCategory(id); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete category"); }
          }}
        />
      )}
      {tab === "courses" && (
        <Courses
          fr={fr}
          courses={courses}
          onEdit={openEdit}
          onDelete={async (id: string) => {
            try { await deleteFormationCourse(id); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete course"); }
          }}
          onSetStatus={async (id: string, status: string) => {
            try { await saveFormationCourse({ id, status }); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to update course status"); }
          }}
        />
      )}
      {tab === "content" && (
        <Content
          fr={fr}
          contents={contents}
          courses={courses}
          onEdit={openEdit}
          onDelete={async (id: string) => {
            try { await deleteFormationContent(id); await loadAll(); }
            catch (err: any) { setError(err?.message || "Failed to delete content"); }
          }}
        />
      )}
      {tab === "consultations" && (
        <Consultations
          fr={fr}
          consultations={consultations}
          onSetStatus={async (id: string, status: string) => {
            try {
              const { error: updErr } = await supabase.from("consultation_requests").update({ status }).eq("id", id);
              if (updErr) throw updErr;
              await loadAll();
            } catch (err: any) { setError(err?.message || "Failed to update request"); }
          }}
        />
      )}
    </div>
  );
}

function Categories({ fr, categories, onEdit, onDelete }: { fr: boolean; categories: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucune catégorie" : "No categories"}</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {categories.map((cat: any) => (
        <div key={cat.id} className="bg-card rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}>
            <BookOpen size={18} color={cat.color} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{fr ? cat.name : (cat.name_en || cat.name)}</h3>
            <StatusBadge status={(cat.status ?? "Active") as any} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{cat.description}</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => onEdit(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button>
            <button onClick={() => onDelete(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Courses({ fr, courses, onEdit, onDelete, onSetStatus }: { fr: boolean; courses: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void; onSetStatus: (id: string, status: string) => void }) {
  if (courses.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucun cours" : "No courses"}</p>;
  }
  return (
    <div className="space-y-4">
      {courses.map((course: any) => (
        <div key={course.id} className="bg-card rounded-2xl border border-border p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{course.title}</h3>
                <StatusBadge status={course.status as any} size="sm" />
                {course.formation_categories && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${course.formation_categories.color}20`, color: course.formation_categories.color }}>
                    {fr ? course.formation_categories.name : (course.formation_categories.name_en || course.formation_categories.name)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{course.lesson_count} {fr ? "leçons" : "lessons"} · {course.duration} · {course.instructor}</p>
              <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{course.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button onClick={() => onEdit(course.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button>
              {course.status !== "Published" && (
                <button onClick={() => onSetStatus(course.id, "Published")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#4CAF68] text-[#4CAF68] text-xs">
                  <CheckCircle size={13} />{fr ? "Publier" : "Publish"}
                </button>
              )}
              {course.status !== "Archived" && (
                <button onClick={() => onSetStatus(course.id, "Archived")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
                  <Archive size={13} />{fr ? "Archiver" : "Archive"}
                </button>
              )}
              <button onClick={() => onDelete(course.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Content({ fr, contents, courses, onEdit, onDelete }: { fr: boolean; contents: any[]; courses: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const icon = (type: string) => (type === "video" ? Video : type === "external_link" ? LinkIcon : FileText);
  const courseTitle = (courseId: string) => courses.find((c) => c.id === courseId)?.title ?? "—";
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Contenus liés aux cours" : "Course content"}</h3>
      {contents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{fr ? "Aucun contenu" : "No content"}</p>
      ) : (
        <div className="space-y-2">
          {contents.map((item: any) => {
            const Icon = icon(item.type);
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                  <Icon size={16} color="#4CAF68" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{courseTitle(item.course_id)} · {item.format} · {item.duration}</p>
                </div>
                <button onClick={() => onEdit(item.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs shrink-0">{fr ? "Gérer" : "Manage"}</button>
                <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] shrink-0">{fr ? "Suppr." : "Delete"}</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Consultations({ fr, consultations, onSetStatus }: { fr: boolean; consultations: any[]; onSetStatus: (id: string, status: string) => void }) {
  if (consultations.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{fr ? "Aucune demande" : "No requests"}</p>;
  }
  return (
    <div className="space-y-4">
      {consultations.map((request: any) => {
        const profile = request.users?.profiles;
        const memberName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : (request.users?.email ?? "—");
        return (
          <div key={request.id} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">{request.type}</h3>
                  <StatusBadge status={(request.status ?? "pending") as any} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{memberName} · {request.project}</p>
                <p className="text-xs text-muted-foreground mt-1">{request.need}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {request.status !== "closed" && (
                  <button onClick={() => onSetStatus(request.id, "closed")} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>
                    {fr ? "Clôturer" : "Close"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryForm({ fr, mode, category, onSave, onCancel, onError }: { fr: boolean; mode: Exclude<FormMode, null>; category?: any; onSave: (c: any) => void; onCancel: () => void; onError: (m: string) => void }) {
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
      <FormTitle title={mode === "create" ? (fr ? "Créer une catégorie" : "Create category") : (fr ? "Modifier la catégorie" : "Edit category")} />
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
          if (coverFile) {
            coverImagePath = await uploadFormationAsset(coverFile, "covers");
          }
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
      <FormTitle title={mode === "create" ? (fr ? "Créer un cours" : "Create course") : (fr ? "Modifier le cours" : "Edit course")} />
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
      <TextareaField name="description" label={fr ? "Description (texte enrichi)" : "Description (rich text)"} defaultValue={course?.description} />
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
      <FormTitle title={mode === "create" ? (fr ? "Ajouter un contenu" : "Add content") : (fr ? "Gérer le contenu" : "Manage content")} />
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

function FormTitle({ title }: { title: string }) {
  return <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{title}</h3>;
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
