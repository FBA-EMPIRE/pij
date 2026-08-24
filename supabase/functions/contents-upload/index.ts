import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { canManageCourse } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const BUCKET = "formation-assets";

// Matches what the "formation-assets" storage bucket actually allows
// (see supabase/migrations/20260705000003_formations_storage.sql) --
// Word/Text uploads would be rejected by the bucket itself.
const ALLOWED_MIME_TO_TYPE: Record<string, { type: string; format: string }> = {
  "application/pdf": { type: "pdf", format: "PDF" },
  "video/mp4": { type: "video", format: "MP4" },
  "video/webm": { type: "video", format: "MP4" },
};

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) throw new Error("Missing or invalid Authorization token");

    const form = await req.formData();
    const courseId = form.get("course_id");
    const title = form.get("title");
    const duration = form.get("duration");
    const externalUrl = form.get("external_url");
    const file = form.get("file");

    if (typeof courseId !== "string" || !courseId) throw new Error("course_id is required");
    if (typeof title !== "string" || !title) throw new Error("title is required");

    if (!(await canManageCourse(authHeader, courseId, userId))) {
      throw new Error("Not authorized to add content to this course");
    }

    const supabase = getServiceClient();
    let insertPayload: Record<string, unknown>;

    if (typeof externalUrl === "string" && externalUrl && !(file instanceof File)) {
      insertPayload = {
        course_id: courseId,
        type: "external_link",
        title,
        duration: typeof duration === "string" ? duration : null,
        format: "Link",
        external_url: externalUrl,
        storage_path: null,
        file_name: null,
        file_size: null,
      };
    } else {
      if (!(file instanceof File)) throw new Error("file is required (or provide external_url)");
      if (file.size > MAX_FILE_BYTES) throw new Error("file exceeds the 10MB size limit");

      const mapping = ALLOWED_MIME_TO_TYPE[file.type];
      if (!mapping) {
        throw new Error(`Unsupported file type "${file.type}". Allowed: PDF, MP4, WebM`);
      }

      const ext = file.name.split(".").pop() || mapping.type;
      const path = `content/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
      });
      if (uploadErr) throw uploadErr;

      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

      insertPayload = {
        course_id: courseId,
        type: mapping.type,
        title,
        duration: typeof duration === "string" ? duration : null,
        format: mapping.format,
        external_url: null,
        storage_path: publicUrl,
        file_name: file.name,
        file_size: formatFileSize(file.size),
      };
    }

    const { data: content, error } = await supabase
      .from("formation_content")
      .insert(insertPayload)
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Content Uploaded",
      entityType: "formation_content",
      entityId: content.id,
      metadata: { course_id: courseId, title },
    });

    return new Response(
      JSON.stringify({ success: true, content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
