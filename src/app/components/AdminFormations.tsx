import { useEffect, useState } from "react";
import { Archive, BookOpen, Calendar, FileText, Plus, Video } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

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

  useEffect(() => {
    (async () => {
      try {
        const [cats, crs, conts, consults] = await Promise.all([
          supabase.from("formation_categories").select("*"),
          supabase.from("formation_courses").select("*"),
          supabase.from("formation_content").select("*"),
          supabase.from("consultation_requests").select("*"),
        ]);
        setCategories(cats.data ?? []);
        setCourses(crs.data ?? []);
        setContents(conts.data ?? []);
        setConsultations(consults.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "categories", label: fr ? "Catégories" : "Categories" },
    { key: "courses", label: fr ? "Cours" : "Courses" },
    { key: "content", label: fr ? "Contenus" : "Content" },
    { key: "consultations", label: fr ? "Consultations" : "Consultations" },
  ];

  const openCreate = () => {
    setFormMode("create");
    setEditingId(null);
  };

  const openEdit = (id: string) => {
    setFormMode("edit");
    setEditingId(id);
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Gestion des Formations" : "Formation Management"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} {fr ? "cours" : "courses"} · {consultations.length} {fr ? "demandes" : "requests"}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Créer" : "Create"}
        </button>
      </div>

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
        <CategoryForm fr={fr} mode={formMode} category={categories.find((c) => c.id === editingId)} onCancel={closeForm} onSave={(category: any) => {
          setCategories((current) => formMode === "edit" ? current.map((c) => c.id === category.id ? category : c) : [{ ...category, id: `category-${Date.now()}` }, ...current]);
          closeForm();
        }} />
      )}
      {formMode && tab === "courses" && (
        <CourseForm fr={fr} mode={formMode} course={courses.find((c) => c.id === editingId)} categories={categories} onCancel={closeForm} onSave={(course: any) => {
          setCourses((current) => formMode === "edit" ? current.map((c) => c.id === course.id ? course : c) : [{ ...course, id: `course-${Date.now()}`, progress: 0, featured: false, image: "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)" }, ...current]);
          closeForm();
        }} />
      )}
      {formMode && tab === "content" && (
        <ContentForm fr={fr} mode={formMode} item={contents.find((c) => c.id === editingId)} courses={courses} onCancel={closeForm} onSave={(item: any) => {
          setContents((current) => formMode === "edit" ? current.map((c) => c.id === item.id ? item : c) : [{ ...item, id: `content-${Date.now()}`, completed: false }, ...current]);
          closeForm();
        }} />
      )}
      {formMode && tab === "consultations" && (
        <ConsultationForm fr={fr} consultation={consultations.find((c) => c.id === editingId)} onCancel={closeForm} onSave={(consultation: any) => {
          setConsultations((current) => current.map((c) => c.id === consultation.id ? consultation : c));
          closeForm();
        }} />
      )}

      {tab === "categories" && <Categories fr={fr} categories={categories} onEdit={openEdit} onDelete={(id: string) => setCategories((current) => current.filter((c) => c.id !== id))} />}
      {tab === "courses" && <Courses fr={fr} courses={courses} onEdit={openEdit} onArchive={(id: string) => setCourses((current) => current.map((c) => c.id === id ? { ...c, status: "Archived" } : c))} />}
      {tab === "content" && <Content fr={fr} contents={contents} onEdit={openEdit} />}
      {tab === "consultations" && <Consultations fr={fr} consultations={consultations} onEdit={openEdit} onClose={(id: string) => setConsultations((current) => current.map((c) => c.id === id ? { ...c, status: "Closed" } : c))} />}
    </div>
  );
}

function Categories({ fr, categories, onEdit, onDelete }: { fr: boolean; categories: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{categories.map((cat: any) => <div key={cat.id} className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}><BookOpen size={18} color={cat.color} /></div><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{cat.name}</h3><StatusBadge status={cat.status as any} size="sm" /></div><p className="text-xs text-muted-foreground mt-2">{cat.description}</p><div className="flex gap-2 mt-4"><button onClick={() => onEdit(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button><button onClick={() => onDelete(cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button></div></div>)}</div>;
}

function Courses({ fr, courses, onEdit, onArchive }: { fr: boolean; courses: any[]; onEdit: (id: string) => void; onArchive: (id: string) => void }) {
  return <div className="space-y-4">{courses.map((course: any) => <div key={course.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{course.title}</h3><StatusBadge status={course.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{course.lessonCount} {fr ? "leçons" : "lessons"} · {course.duration} · {course.instructor}</p><p className="text-sm text-muted-foreground mt-3 max-w-2xl">{course.description}</p></div><div className="flex gap-2"><button onClick={() => onEdit(course.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button><button onClick={() => onArchive(course.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground"><Archive size={13} />{fr ? "Archiver" : "Archive"}</button></div></div></div>)}</div>;
}

function Content({ fr, contents, onEdit }: { fr: boolean; contents: any[]; onEdit: (id: string) => void }) {
  const icon = (type: string) => type === "video" ? Video : FileText;
  return <div className="bg-card rounded-2xl border border-border p-5"><h3 className="mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Contenus liés aux cours" : "Course content"}</h3><div className="space-y-2">{contents.map((item: any) => { const Icon = icon(item.type); return <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div className="w-9 h-9 rounded-xl bg-[#E8F5EC] flex items-center justify-center"><Icon size={16} color="#4CAF68" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-muted-foreground">{item.format} · {item.duration}</p>{item.fileName && <p className="text-xs text-[#4CAF68] truncate mt-0.5">{item.fileName}{item.fileSize ? ` · ${item.fileSize}` : ""}</p>}</div><button onClick={() => onEdit(item.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Gérer" : "Manage"}</button></div>; })}</div></div>;
}

function Consultations({ fr, consultations, onEdit, onClose }: { fr: boolean; consultations: any[]; onEdit: (id: string) => void; onClose: (id: string) => void }) {
  return <div className="space-y-4">{consultations.map((request: any) => <div key={request.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-semibold">{request.type}</h3><StatusBadge status={request.status as any} size="sm" /></div><p className="text-xs text-muted-foreground">{request.member} · {request.project}</p><p className="text-xs text-muted-foreground mt-1">{request.consultant} · {request.meetingDate}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onEdit(request.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Assigner" : "Assign"}</button><button onClick={() => onEdit(request.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs"><Calendar size={13} />{fr ? "Planifier" : "Schedule"}</button><button onClick={() => onClose(request.id)} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: "#4CAF68" }}>{fr ? "Clôturer" : "Close"}</button></div></div></div>)}</div>;
}

function CategoryForm({ fr, mode, category, onSave, onCancel }: { fr: boolean; mode: Exclude<FormMode, null>; category?: any; onSave: (category: any) => void; onCancel: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ id: category?.id ?? "", name: String(data.get("name") || ""), nameEn: String(data.get("nameEn") || data.get("name") || ""), description: String(data.get("description") || ""), color: String(data.get("color") || "#4CAF68"), status: "Active" }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><FormTitle title={mode === "create" ? (fr ? "Créer une catégorie" : "Create category") : (fr ? "Modifier la catégorie" : "Edit category")} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field name="name" label={fr ? "Nom" : "Name"} defaultValue={category?.name} /><Field name="nameEn" label={fr ? "Nom anglais" : "English name"} defaultValue={category?.nameEn} /><Field name="color" label={fr ? "Couleur" : "Color"} defaultValue={category?.color ?? "#4CAF68"} /><Field name="description" label="Description" defaultValue={category?.description} /></div><FormActions fr={fr} onCancel={onCancel} /> </form>;
}

function CourseForm({ fr, mode, course, categories, onSave, onCancel }: { fr: boolean; mode: Exclude<FormMode, null>; course?: any; categories: any[]; onSave: (course: any) => void; onCancel: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ ...course, id: course?.id ?? "", categoryId: String(data.get("categoryId") || categories[0]?.id || "entrepreneurship"), title: String(data.get("title") || ""), titleEn: String(data.get("titleEn") || data.get("title") || ""), description: String(data.get("description") || ""), instructor: String(data.get("instructor") || ""), duration: String(data.get("duration") || "1h"), lessonCount: Number(data.get("lessonCount") || 1), level: String(data.get("level") || "Débutant"), status: String(data.get("status") || "Published"), progress: course?.progress ?? 0, featured: course?.featured ?? false, image: course?.image ?? "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)" }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><FormTitle title={mode === "create" ? (fr ? "Créer un cours" : "Create course") : (fr ? "Modifier le cours" : "Edit course")} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field name="title" label={fr ? "Titre" : "Title"} defaultValue={course?.title} /><Field name="titleEn" label={fr ? "Titre anglais" : "English title"} defaultValue={course?.titleEn} /><SelectField name="categoryId" label={fr ? "Catégorie" : "Category"} defaultValue={course?.categoryId} options={categories.map((c: any) => ({ value: c.id, label: c.name }))} /><Field name="instructor" label={fr ? "Formateur" : "Instructor"} defaultValue={course?.instructor} /><Field name="duration" label={fr ? "Durée" : "Duration"} defaultValue={course?.duration} /><Field name="lessonCount" label={fr ? "Nombre de leçons" : "Lessons"} type="number" defaultValue={String(course?.lessonCount ?? 1)} /><Field name="level" label={fr ? "Niveau" : "Level"} defaultValue={course?.level} /><SelectField name="status" label="Status" defaultValue={course?.status} options={["Published", "Draft", "Archived"].map((s) => ({ value: s, label: s }))} /></div><TextareaField name="description" label="Description" defaultValue={course?.description} /><FormActions fr={fr} onCancel={onCancel} /></form>;
}

function ContentForm({ fr, mode, item, courses, onSave, onCancel }: { fr: boolean; mode: Exclude<FormMode, null>; item?: any; courses: any[]; onSave: (item: any) => void; onCancel: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const upload = data.get("upload"); const file = upload instanceof File && upload.size > 0 ? upload : null; const fileExtension = file?.name.split(".").pop()?.toUpperCase(); onSave({ id: item?.id ?? "", courseId: String(data.get("courseId") || courses[0]?.id || ""), type: String(data.get("type") || "video"), title: String(data.get("title") || file?.name || ""), duration: String(data.get("duration") || (file ? formatFileSize(file.size) : "10 min")), format: fileExtension || String(data.get("format") || "MP4"), completed: item?.completed ?? false, fileName: file?.name ?? item?.fileName, fileSize: file ? formatFileSize(file.size) : item?.fileSize }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><FormTitle title={mode === "create" ? (fr ? "Ajouter un contenu" : "Add content") : (fr ? "Gérer le contenu" : "Manage content")} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SelectField name="courseId" label={fr ? "Cours lié" : "Linked course"} defaultValue={item?.courseId} options={courses.map((c: any) => ({ value: c.id, label: c.title }))} /><SelectField name="type" label="Type" defaultValue={item?.type} options={["video", "book", "note", "assignment"].map((t) => ({ value: t, label: t }))} /><Field name="title" label={fr ? "Titre" : "Title"} defaultValue={item?.title} /><Field name="duration" label={fr ? "Durée / taille" : "Duration / size"} defaultValue={item?.duration} /><Field name="format" label="Format" defaultValue={item?.format} /><FileField fr={fr} fileName={item?.fileName} /></div><p className="text-xs text-muted-foreground">{fr ? "Formats acceptés : PDF, DOCX, MP3, MP4. Le fichier est simulé dans l'interface jusqu'à connexion au stockage Supabase." : "Accepted formats: PDF, DOCX, MP3, MP4. File storage is simulated in the UI until Supabase storage is connected."}</p><FormActions fr={fr} onCancel={onCancel} /></form>;
}

function ConsultationForm({ fr, consultation, onSave, onCancel }: { fr: boolean; consultation?: any; onSave: (consultation: any) => void; onCancel: () => void }) {
  if (!consultation) return null;
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ ...consultation, consultant: String(data.get("consultant") || "Non assigné"), meetingDate: String(data.get("meetingDate") || "À planifier"), status: String(data.get("status") || "Scheduled") }); }} className="mb-6 bg-card rounded-2xl border border-border p-5 space-y-4"><FormTitle title={fr ? "Assigner / planifier la consultation" : "Assign / schedule consultation"} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field name="consultant" label={fr ? "Consultant" : "Consultant"} defaultValue={consultation.consultant} /><Field name="meetingDate" label={fr ? "Date de rendez-vous" : "Meeting date"} defaultValue={consultation.meetingDate} /><SelectField name="status" label="Status" defaultValue={consultation.status} options={["Pending", "Scheduled", "Closed"].map((s) => ({ value: s, label: s }))} /></div><FormActions fr={fr} onCancel={onCancel} /></form>;
}

function FormTitle({ title }: { title: string }) {
  return <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{title}</h3>;
}

function Field({ name, label, defaultValue = "", type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return <div><label className="text-sm font-medium">{label}</label><input name={name} type={type} defaultValue={defaultValue} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" /></div>;
}

function TextareaField({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return <div><label className="text-sm font-medium">{label}</label><textarea name={name} defaultValue={defaultValue} rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" /></div>;
}

function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return <div><label className="text-sm font-medium">{label}</label><select name={name} defaultValue={defaultValue ?? options[0]?.value} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}

function FileField({ fr, fileName }: { fr: boolean; fileName?: string }) {
  return <div><label className="text-sm font-medium">{fr ? "Fichier" : "File"}</label><input name="upload" type="file" accept=".pdf,.docx,.mp3,.mp4,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/mpeg,video/mp4" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F5EC] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#1F9D55]" />{fileName && <p className="text-xs text-muted-foreground mt-1">{fr ? "Fichier actuel" : "Current file"}: {fileName}</p>}</div>;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function FormActions({ fr, onCancel }: { fr: boolean; onCancel: () => void }) {
  return <div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">{fr ? "Annuler" : "Cancel"}</button><button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Enregistrer" : "Save"}</button></div>;
}
