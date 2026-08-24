import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateFormationUpdate } from "../_shared/validators.ts";
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
    const { id, patch } = validateFormationUpdate(body);

    if (!(await canManageFormation(authHeader, id, userId))) {
      throw new Error("Not authorized to update this formation");
    }

    const supabase = getServiceClient();
    const { data: formation, error } = await supabase
      .from("formations")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Updated",
      entityType: "formation",
      entityId: id,
      metadata: patch,
    });

    return new Response(
      JSON.stringify({ success: true, formation }),
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
