import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateInvestmentRequestId } from "../_shared/validators.ts";
import { getCallerAdmin, logAudit } from "../_shared/admin-auth.ts";
import { assertNotInMaintenance } from "../_shared/system-settings.ts";
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
    await assertNotInMaintenance(supabase);

    const body = await req.json();
    const validated = validateInvestmentRequestId(body);

    const { data: request, error: reqErr } = await supabase
      .from("investment_requests")
      .select("id, user_id, amount, status")
      .eq("id", validated.request_id)
      .maybeSingle();
    if (reqErr) throw reqErr;
    if (!request) throw new Error("Investment request not found");
    if (request.status !== "Pending") throw new Error("Only pending requests can be rejected");

    const { error: updateErr } = await supabase
      .from("investment_requests")
      .update({ status: "Rejected", reviewed_by: caller.id, reviewed_at: new Date().toISOString() })
      .eq("id", request.id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Investment Rejected",
      entityType: "investment_request",
      entityId: request.id,
      metadata: { user_id: request.user_id, amount: request.amount },
    });

    await supabase.from("notifications").insert({
      user_id: request.user_id,
      type: "general",
      title: "Investment rejected",
      message: `Your investment request of ${request.amount} XAF was not approved.`,
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
