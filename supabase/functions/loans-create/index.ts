import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateLoanCreate } from "../_shared/validators.ts";
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
    const validated = validateLoanCreate(body);

    const { data: loan, error } = await supabase
      .from("loans")
      .insert({
        user_id: userId,
        amount: validated.amount,
        interest: validated.interest ?? 0,
        loan_date: validated.loan_date,
        repayment_date: validated.repayment_date,
        is_repaid: false,
      })
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Loan Application Submitted",
      entityType: "loan",
      entityId: loan.id,
      metadata: { amount: validated.amount, interest: validated.interest ?? 0 },
    });

    return new Response(
      JSON.stringify({ success: true, loan }),
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
