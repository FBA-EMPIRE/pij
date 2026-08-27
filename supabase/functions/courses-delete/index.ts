import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateIdBody } from "../_shared/validators.ts";
import { canManageCourse } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorMessage } from "../_shared/errors.ts";

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

    if (!(await canManageCourse(authHeader, id, userId))) {
      throw new Error("Not authorized to delete this course");
    }

    const supabase = getServiceClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("formation_courses")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Course not found");

    // formation_content cascades via ON DELETE CASCADE.
    const { error: deleteErr } = await supabase.from("formation_courses").delete().eq("id", id);
    if (deleteErr) throw deleteErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Course Deleted",
      entityType: "formation_course",
      entityId: id,
      metadata: { title: existing.title },
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
