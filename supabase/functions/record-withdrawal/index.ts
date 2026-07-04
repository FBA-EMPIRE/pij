import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateWithdrawal } from "../_shared/validators.ts";
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
    const validated = validateWithdrawal(body);

    const recordedBy = caller.id;

    const { data: account, error: acctErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", validated.user_id)
      .eq("account_type", validated.account_type)
      .single();

    if (acctErr || !account) {
      throw new Error("Account not found for this user and account type");
    }

    const currentBalance = Number(account.balance);
    if (currentBalance < validated.amount) {
      throw new Error("Insufficient funds");
    }

    const newBalance = currentBalance - validated.amount;

    const { error: updateErr } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id);

    if (updateErr) throw updateErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: "withdrawal",
        amount: validated.amount,
        balance_after: newBalance,
        recorded_by: recordedBy,
        notes: body.description ?? null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txnErr) throw txnErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Withdrawal Recorded",
      entityType: "transaction",
      entityId: txn.id,
      metadata: { user_id: validated.user_id, account_type: validated.account_type, amount: validated.amount },
    });

    await supabase.from("notifications").insert({
      user_id: validated.user_id,
      type: "general",
      title: "Withdrawal recorded",
      message: `A withdrawal of ${validated.amount} XAF was recorded from your ${validated.account_type} account.`,
    });

    return new Response(
      JSON.stringify({ success: true, transaction: txn }),
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
