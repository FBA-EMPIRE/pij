import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateIdBody } from "../_shared/validators.ts";
import { canManageFormation } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    if (!(await canManageFormation(authHeader, id, userId))) {
      throw new Error("Not authorized to delete this formation");
    }

    const supabase = getServiceClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("formations")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Formation not found");

    // formation_courses -> formation_content cascade via ON DELETE CASCADE,
    // so deleting the formation row is enough.
    const { error: deleteErr } = await supabase.from("formations").delete().eq("id", id);
    if (deleteErr) throw deleteErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Deleted",
      entityType: "formation",
      entityId: id,
      metadata: { title: existing.title },
    });

    return new Response(
      JSON.stringify({ success: true }),
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
