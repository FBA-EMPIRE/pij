import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { supabase } from "../../lib/supabase/client";
import { coursesApi, type Course, type FormationStatus } from "../../lib/api/formations";
import { Modal } from "./Modal";
import { Field, TextareaField, SelectField } from "./FormFields";

export interface CourseFormProps {
  // Required to create a course (courses-create needs a formation_id) --
  // not listed in the original spec's prop list, but there's no way to
  // create a course without it.
  formationId: string;
  mode: "create" | "edit";
  initialData?: Course;
  onSuccess: (course: Course) => void;
  onCancel: () => void;
}

// The real formation_courses columns go beyond the spec's four fields
// (title/description/duration/status) -- instructor, level and
// lesson_count are already read by the member-facing course page, and
// featured drives the "Formations à la une" section, so they're kept
// here rather than dropped to match the shorter field list literally.
export default function CourseForm({ formationId, mode, initialData, onSuccess, onCancel }: CourseFormProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = new FormData(event.currentTarget);
      let coverImagePath = initialData?.cover_image_path ?? undefined;
      if (coverFile) coverImagePath = await uploadCoverImage(coverFile);

      const payload = {
        title: String(data.get("title") || ""),
        title_en: String(data.get("title_en") || data.get("title") || ""),
        description: String(data.get("description") || ""),
        instructor: String(data.get("instructor") || ""),
        duration: String(data.get("duration") || "1h"),
        lesson_count: Number(data.get("lesson_count") || 1),
        level: String(data.get("level") || "Débutant"),
        status: String(data.get("status") || "Draft") as FormationStatus,
        featured: data.get("featured") === "on",
        cover_image_path: coverImagePath,
        image: initialData?.image ?? "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)",
      };

      const res = mode === "edit" && initialData
        ? await coursesApi.update(initialData.id, payload)
        : await coursesApi.create({ formation_id: formationId, ...payload });

      if (!res.success || !res.data) throw new Error(res.error || "Failed to save course");
      toast.success(fr ? "Cours enregistré" : "Course saved");
      onSuccess(res.data.course);
    } catch (err: any) {
      const message = err?.message || "Failed to save course";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={mode === "create" ? (fr ? "Créer un cours" : "Create course") : (fr ? "Modifier le cours" : "Edit course")}
      onClose={onCancel}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="title" label={fr ? "Titre" : "Title"} defaultValue={initialData?.title} required />
          <Field name="title_en" label={fr ? "Titre anglais" : "English title"} defaultValue={initialData?.title_en ?? ""} />
          <Field name="instructor" label={fr ? "Formateur" : "Instructor"} defaultValue={initialData?.instructor ?? ""} />
          <Field name="duration" label={fr ? "Durée" : "Duration"} defaultValue={initialData?.duration ?? ""} />
          <Field name="lesson_count" label={fr ? "Nombre de leçons" : "Lessons"} type="number" defaultValue={String(initialData?.lesson_count ?? 1)} />
          <Field name="level" label={fr ? "Niveau" : "Level"} defaultValue={initialData?.level ?? ""} />
          <SelectField
            name="status"
            label={fr ? "Statut" : "Status"}
            defaultValue={initialData?.status}
            options={[
              { value: "Draft", label: fr ? "Brouillon" : "Draft" },
              { value: "Published", label: fr ? "Publié" : "Published" },
              { value: "Archived", label: fr ? "Archivé" : "Archived" },
            ]}
          />
        </div>
        <TextareaField name="description" label={fr ? "Description" : "Description"} defaultValue={initialData?.description ?? ""} />
        <div>
          <label className="text-sm font-medium flex items-center gap-2"><Upload size={14} /> {fr ? "Image de couverture" : "Cover image"}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F5EC] dark:file:bg-[#1A3326] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#1F9D55] dark:file:text-[#4CAF68]"
          />
          {initialData?.cover_image_path && !coverFile && (
            <p className="text-xs text-muted-foreground mt-1">{fr ? "Image actuelle définie" : "Current cover image is set"}</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initialData?.featured} className="rounded border-border accent-[#4CAF68]" />
          {fr ? "Mettre en avant" : "Featured"}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>
            {saving
              ? (fr ? "Enregistrement..." : "Saving...")
              : mode === "create" ? (fr ? "Ajouter" : "Add") : (fr ? "Enregistrer" : "Save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Cover images aren't handled by an Edge Function (only course/formation
// documents go through contents-upload) -- upload straight to the
// formation-assets bucket, RLS still allows it for admins/trainers.
async function uploadCoverImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("formation-assets").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("formation-assets").getPublicUrl(path).data.publicUrl;
}
