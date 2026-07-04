import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateKycAction } from "../_shared/validators.ts";
import { getCallerAdmin, logAudit } from "../_shared/admin-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
      .update({ kyc_status: "rejected" })
      .eq("id", validated.user_id);

    if (userErr) throw userErr;

    const docUpdate: Record<string, unknown> = {
      status: "rejected",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    };
    if (validated.reason) {
      docUpdate.rejection_reason = validated.reason;
    }

    const { error: docErr } = await supabase
      .from("kyc_documents")
      .update(docUpdate)
      .eq("user_id", validated.user_id)
      .eq("status", "pending");

    if (docErr) throw docErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "KYC Rejected",
      entityType: "user",
      entityId: validated.user_id,
      metadata: validated.reason ? { reason: validated.reason } : undefined,
    });

    await supabase.from("notifications").insert({
      user_id: validated.user_id,
      type: "kyc_status",
      title: "KYC verification rejected",
      message: validated.reason
        ? `Your identity verification was rejected: ${validated.reason}`
        : "Your identity verification was rejected. Please contact support for details.",
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
