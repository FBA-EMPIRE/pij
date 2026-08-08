import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateLoanUpdate } from "../_shared/validators.ts";
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

    const supabase = getServiceClient();
    const body = await req.json();
    const { loan_id, is_repaid, result } = validateLoanUpdate(body);

    const { data: loan, error: loanErr } = await supabase
      .from("loans")
      .select("id, user_id")
      .eq("id", loan_id)
      .maybeSingle();
    if (loanErr) throw loanErr;
    if (!loan) throw new Error("Loan not found");

    if (loan.user_id !== userId) {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id, is_active")
        .eq("id", userId)
        .maybeSingle();
      if (!adminRow?.is_active) throw new Error("Not authorized to update this loan");
    }

    const patch: Record<string, unknown> = {};
    if (is_repaid !== undefined) patch.is_repaid = is_repaid;
    if (result !== undefined) patch.result = result;
    if (Object.keys(patch).length === 0) throw new Error("Nothing to update");

    const { data: updated, error: updateErr } = await supabase
      .from("loans")
      .update(patch)
      .eq("id", loan_id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Loan Updated",
      entityType: "loan",
      entityId: loan_id,
      metadata: patch,
    });

    return new Response(
      JSON.stringify({ success: true, loan: updated }),
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
