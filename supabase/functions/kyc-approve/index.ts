import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateKycAction } from "../_shared/validators.ts";
import { getCallerAdmin, logAudit } from "../_shared/admin-auth.ts";
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

    const body = await req.json();
    const validated = validateKycAction(body);

    const reviewedBy = caller.id;

    const { error: userErr } = await supabase
      .from("users")
      .update({ kyc_status: "approved" })
      .eq("id", validated.user_id);

    if (userErr) throw userErr;

    const { error: docErr } = await supabase
      .from("kyc_documents")
      .update({
        status: "approved",
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", validated.user_id)
      .eq("status", "pending");

    if (docErr) throw docErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "KYC Approved",
      entityType: "user",
      entityId: validated.user_id,
    });

    await supabase.from("notifications").insert({
      user_id: validated.user_id,
      type: "kyc_status",
      title: "KYC verification approved",
      message: "Your identity verification has been approved. You now have full access to PIJ services.",
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
