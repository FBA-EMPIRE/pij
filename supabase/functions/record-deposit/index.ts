import { getSupabaseClient, extractUserId, isServiceRoleKey } from "../_shared/supabase-client.ts";
import { validateDeposit } from "../_shared/validators.ts";

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
    const supabase = getSupabaseClient(authHeader);

    const body = await req.json();
    const validated = validateDeposit(body);

    let adminId = authHeader ? extractUserId(authHeader) : null;
    if (!adminId && authHeader && isServiceRoleKey(authHeader)) {
      adminId = body.admin_id ?? null;
    }
    if (!adminId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", validated.user_id)
      .eq("account_type", validated.account_type)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ success: false, error: "Account not found for this user and account type" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const balanceAfter = Number(account.balance) + validated.amount;

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: "deposit",
        amount: validated.amount,
        balance_after: balanceAfter,
        recorded_by: adminId,
        notes: body.notes ?? null,
        transaction_reference: body.transaction_reference ?? null,
        external_id: body.external_id ?? null,
      })
      .select()
      .single();

    if (txError) {
      return new Response(
        JSON.stringify({ success: false, error: txError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: updateError } = await supabase
      .from("accounts")
      .update({ balance: balanceAfter })
      .eq("id", account.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, transaction }),
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
