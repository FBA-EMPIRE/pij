import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateTransactionRequestId } from "../_shared/validators.ts";
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
    const { request_id, reason } = validateTransactionRequestId(body);

    const { data: request, error: reqErr } = await supabase
      .from("transaction_requests")
      .select("id, user_id, type, account_type, amount, status")
      .eq("id", request_id)
      .maybeSingle();
    if (reqErr) throw reqErr;
    if (!request) throw new Error("Request not found");
    if (request.status !== "Pending") throw new Error("Only pending requests can be rejected");

    const { error: updateReqErr } = await supabase
      .from("transaction_requests")
      .update({
        status: "Rejected",
        reviewed_by: caller.id,
        reviewed_at: new Date().toISOString(),
        notes: reason ?? null,
      })
      .eq("id", request.id);
    if (updateReqErr) throw updateReqErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: request.type === "deposit" ? "Deposit Request Rejected" : "Withdrawal Request Rejected",
      entityType: "transaction_request",
      entityId: request.id,
      metadata: { user_id: request.user_id, account_type: request.account_type, amount: request.amount, reason },
    });

    await supabase.from("notifications").insert({
      user_id: request.user_id,
      type: "general",
      title: request.type === "deposit" ? "Deposit request declined" : "Withdrawal request declined",
      message: reason
        ? `Your ${request.type} request of ${request.amount} XAF was declined: ${reason}`
        : `Your ${request.type} request of ${request.amount} XAF was declined.`,
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
