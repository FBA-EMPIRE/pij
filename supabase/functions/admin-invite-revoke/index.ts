import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateInvitationId } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, logAudit } from "../_shared/admin-auth.ts";
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
    requireSuperAdmin(caller);

    const body = await req.json();
    const { invitation_id } = validateInvitationId(body);

    const { error: updateErr } = await supabase
      .from("admin_invitations")
      .update({ status: "Revoked" })
      .eq("id", invitation_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Invitation Revoked",
      entityType: "admin_invitation",
      entityId: invitation_id,
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
