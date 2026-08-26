import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, Video, X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { supabase, supabaseUrl, supabaseAnonKey } from "../../lib/supabase/client";
import type { Content } from "../../lib/api/formations";
import { Modal } from "./Modal";
import { Field } from "./FormFields";

// Matches what the formation-assets storage bucket actually accepts
// (supabase/migrations/20260705000003_formations_storage.sql) --
// PDF/MP4/WebM only. Word and plain-text files are not in the bucket's
// allowed_mime_types, so accepting them here would just fail server-side;
// the spec's "PDF, Word, Text" was never backed by the real bucket config.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "video/mp4": "MP4",
  "video/webm": "WebM",
};
const MAX_BYTES = 10 * 1024 * 1024;

export interface ContentUploadProps {
  courseId: string;
  onSuccess: (content: Content) => void;
  onCancel: () => void;
}

export default function ContentUpload({ courseId, onSuccess, onCancel }: ContentUploadProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    setError("");
    if (!f) { setFile(null); return; }
    if (!ALLOWED_TYPES[f.type]) {
      setError(fr ? "Type de fichier non autorisé. Formats acceptés : PDF, MP4, WebM." : "File type not allowed. Accepted formats: PDF, MP4, WebM.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(fr ? "Le fichier dépasse la taille maximale de 10 Mo." : "File exceeds the 10MB size limit.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError(fr ? "Veuillez sélectionner un fichier." : "Please select a file.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const form = new FormData();
    form.set("course_id", courseId);
    form.set("title", String(data.get("title") || file.name));
    const duration = String(data.get("duration") || "");
    if (duration) form.set("duration", duration);
    form.set("file", file);

    setUploading(true);
    setError("");
    setProgress(0);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? supabaseAnonKey;
      const content = await uploadWithProgress(form, token, setProgress);
      toast.success(fr ? "Contenu ajouté" : "Content added");
      onSuccess(content);
    } catch (err: any) {
      const message = err?.message || (fr ? "Échec de l'envoi" : "Upload failed");
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title={fr ? "Ajouter un fichier" : "Add a file"} onClose={onCancel} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragging ? "border-[#4CAF68] bg-[#4CAF68]/5" : "border-border"}`}
        >
          {file ? (
            <>
              {file.type === "application/pdf" ? <FileText size={28} color="#4CAF68" /> : <Video size={28} color="#4CAF68" />}
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              <button type="button" onClick={(e) => { e.stopPropagation(); pickFile(null); }} className="flex items-center gap-1 text-xs text-[#E5484D] hover:underline">
                <X size={12} /> {fr ? "Retirer" : "Remove"}
              </button>
            </>
          ) : (
            <>
              <Upload size={24} className="text-muted-foreground" />
              <p className="text-sm text-center">
                {fr ? "Glissez-déposez un fichier ici, ou cliquez pour parcourir" : "Drag and drop a file here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, MP4, WebM · {fr ? "10 Mo max" : "Max 10MB"}</p>
            </>
          )}
          <input ref={inputRef} type="file" accept={Object.keys(ALLOWED_TYPES).join(",")} className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
        </div>

        <Field name="title" label={fr ? "Titre" : "Title"} />
        <Field name="duration" label={fr ? "Durée / taille (optionnel)" : "Duration / size (optional)"} />

        {uploading && (
          <div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-[#4CAF68] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button type="submit" disabled={uploading || !file} className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: "#4CAF68" }}>
            {uploading ? (fr ? `Envoi... ${progress}%` : `Uploading... ${progress}%`) : (fr ? "Ajouter" : "Add")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Bypasses the generic invokeEdgeFunction fetch() wrapper for this one
// call -- fetch has no upload-progress API, XMLHttpRequest does.
function uploadWithProgress(form: FormData, token: string, onProgress: (pct: number) => void): Promise<Content> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/functions/v1/contents-upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let json: any = null;
      try { json = JSON.parse(xhr.responseText); } catch { /* non-JSON response */ }
      if (xhr.status >= 200 && xhr.status < 300 && json?.success) {
        resolve(json.content as Content);
      } else {
        reject(new Error(json?.error || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}
