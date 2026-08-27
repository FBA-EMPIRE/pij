import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateFormateurRequestReview } from "../_shared/validators.ts";
import { getCallerAdmin, requireAdminOrSuperAdmin, logAudit } from "../_shared/admin-auth.ts";
import { assignFormateurRole } from "../_shared/formateur.ts";
import { createNotification } from "../_shared/notifications.ts";
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
    const supabase = getServiceClient();

    const caller = await getCallerAdmin(authHeader, supabase);
    requireAdminOrSuperAdmin(caller);

    const body = await req.json();
    const { request_id, admin_notes } = validateFormateurRequestReview(body);

    const { data: request, error } = await supabase
      .from("formateur_requests").select("id, user_id, status").eq("id", request_id).maybeSingle();
    if (error) throw error;
    if (!request) throw new Error("Request not found");
    if ((request as any).status !== "pending") throw new Error("Request is not pending");

    await assignFormateurRole(supabase, (request as any).user_id);

    await supabase.from("formateur_requests").update({
      status: "approved", admin_notes: admin_notes ?? null,
      reviewed_by: caller.id, reviewed_at: new Date().toISOString(),
    }).eq("id", request_id);

    await createNotification(supabase, {
      userId: (request as any).user_id, type: "role_change",
      title: "Vous avez été promu Formateur",
      message: "Votre demande a été acceptée. Déconnectez-vous puis reconnectez-vous pour accéder à votre espace Formateur.",
    });

    await logAudit(supabase, {
      actorId: caller.id, action: "Formateur Request Approved", entityType: "formateur_request",
      entityId: request_id, metadata: { promoted_user_id: (request as any).user_id },
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
