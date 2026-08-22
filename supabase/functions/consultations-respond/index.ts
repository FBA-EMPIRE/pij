import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateConsultationRespond } from "../_shared/validators.ts";
import { canManageFormation, canManageCourse, isAdmin } from "../_shared/role-check.ts";
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
    const { id, response, status } = validateConsultationRespond(body);

    const supabase = getServiceClient();
    const { data: consultation, error: fetchErr } = await supabase
      .from("consultation_requests")
      .select("id, formation_id, course_id")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!consultation) throw new Error("Consultation request not found");

    let allowed = false;
    if (consultation.formation_id) {
      allowed = await canManageFormation(authHeader, consultation.formation_id, userId);
    } else if (consultation.course_id) {
      allowed = await canManageCourse(authHeader, consultation.course_id, userId);
    } else {
      allowed = await isAdmin(authHeader, userId);
    }
    if (!allowed) throw new Error("Not authorized to respond to this consultation request");

    // The live table tracks a response via admin_notes + status, rather
    // than the response/responded_by/responded_at columns from the spec --
    // record who responded and when in audit_logs instead.
    const { data: updated, error: updateErr } = await supabase
      .from("consultation_requests")
      .update({ admin_notes: response, status })
      .eq("id", id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Consultation Responded",
      entityType: "consultation_request",
      entityId: id,
      metadata: { response, status, responded_at: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true, consultation: updated }),
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
