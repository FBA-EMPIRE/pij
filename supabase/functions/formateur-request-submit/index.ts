import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorMessage } from "../_shared/errors.ts";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, matches the formateur-applications bucket's own limit
const MIN_FILES = 1;
const MAX_FILES = 3;
const BUCKET = "formateur-applications";
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

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

  const supabase = getServiceClient();
  let requestId: string | null = null;
  const uploadedPaths: string[] = [];

  try {
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) throw new Error("Missing or invalid Authorization token");

    const form = await req.formData();
    const name = form.get("name");
    const email = form.get("email");
    const category = form.get("category");
    const message = form.get("message");
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (typeof name !== "string" || !name.trim()) throw new Error("name is required");
    if (typeof email !== "string" || !email.trim()) throw new Error("email is required");
    if (typeof category !== "string" || !category.trim()) throw new Error("category is required");
    if (files.length < MIN_FILES) throw new Error(`At least ${MIN_FILES} supporting document is required`);
    if (files.length > MAX_FILES) throw new Error(`No more than ${MAX_FILES} supporting documents are allowed`);
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        throw new Error(`Unsupported file type "${file.type}" for "${file.name}". Allowed: PDF, PNG, JPEG`);
      }
      if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" exceeds the 10MB size limit`);
    }

    // Friendlier than letting the one-pending-per-user unique index
    // violation surface as a raw Postgres error.
    const { data: existingPending, error: pendingCheckErr } = await supabase
      .from("formateur_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    if (pendingCheckErr) throw pendingCheckErr;
    if (existingPending) throw new Error("You already have a pending trainer application");

    const { data: request, error: insErr } = await supabase
      .from("formateur_requests")
      .insert({
        user_id: userId,
        applicant_name: name.trim(),
        applicant_email: email.trim(),
        category: category.trim(),
        message: typeof message === "string" ? message : "",
      })
      .select()
      .single();
    if (insErr) throw insErr;
    requestId = request.id;

    for (const file of files) {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `${userId}/${requestId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
      });
      if (uploadErr) throw uploadErr;
      uploadedPaths.push(path);

      const { error: docErr } = await supabase.from("formateur_request_documents").insert({
        request_id: requestId,
        storage_path: path,
        file_name: file.name,
        file_size: formatFileSize(file.size),
      });
      if (docErr) throw docErr;
    }

    await logAudit(supabase, {
      actorId: userId,
      action: "Formateur Request Submitted",
      entityType: "formateur_request",
      entityId: requestId,
      metadata: { category: category.trim(), file_count: files.length },
    });

    return new Response(
      JSON.stringify({ success: true, request }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // No true DB transaction is available in this stack (the same
    // limitation contents-upload already accepts elsewhere in this
    // codebase), so a failed submission is rolled back explicitly here --
    // otherwise a partially-created request would sit as an orphaned
    // "empty" pending row, which the one-pending-per-user unique index
    // would then wrongly use to block the user from retrying. Deleting
    // the request row also cascades to any formateur_request_documents
    // rows already inserted for it.
    try {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      }
      if (requestId) {
        await supabase.from("formateur_requests").delete().eq("id", requestId);
      }
    } catch {
      // best-effort rollback -- the original error below is what matters
    }

    const message = errorMessage(err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
