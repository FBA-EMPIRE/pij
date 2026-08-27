import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateIdBody } from "../_shared/validators.ts";
import { canManageCourse } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorMessage } from "../_shared/errors.ts";

const BUCKET = "formation-assets";

// storage_path holds the full public URL (see contents-upload / the
// existing FormationDetail.tsx upload flow), not a bare storage key --
// pull the key back out so we can call storage.remove().
function storageKeyFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
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

    const body = await req.json();
    const { id } = validateIdBody(body);

    const supabase = getServiceClient();
    const { data: content, error: fetchErr } = await supabase
      .from("formation_content")
      .select("id, course_id, storage_path")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!content) throw new Error("Content not found");

    if (!(await canManageCourse(authHeader, content.course_id, userId))) {
      throw new Error("Not authorized to delete this content");
    }

    if (content.storage_path) {
      const key = storageKeyFromPublicUrl(content.storage_path);
      if (key) await supabase.storage.from(BUCKET).remove([key]);
    }

    const { error: deleteErr } = await supabase.from("formation_content").delete().eq("id", id);
    if (deleteErr) throw deleteErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Content Deleted",
      entityType: "formation_content",
      entityId: id,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = errorMessage(err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
