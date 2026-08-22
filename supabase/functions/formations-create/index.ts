import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateFormationCreate } from "../_shared/validators.ts";
import { isTrainer, isAdmin } from "../_shared/role-check.ts";
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

    const allowed = (await isTrainer(authHeader, userId)) || (await isAdmin(authHeader, userId));
    if (!allowed) throw new Error("Only trainers or admins can create formations");

    const body = await req.json();
    const validated = validateFormationCreate(body);

    const supabase = getServiceClient();
    const { data: formation, error } = await supabase
      .from("formations")
      .insert({
        title: validated.title,
        title_en: validated.title_en ?? null,
        description: validated.description ?? null,
        description_en: validated.description_en ?? null,
        cover_image: validated.cover_image ?? null,
        status: validated.status ?? "Draft",
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Created",
      entityType: "formation",
      entityId: formation.id,
      metadata: { title: validated.title, status: formation.status },
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
