import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateDeposit } from "../_shared/validators.ts";
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
    const validated = validateDeposit(body);

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

    const newBalance = Number(account.balance) + validated.amount;

    const { error: updateErr } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id);

    if (updateErr) throw updateErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: "deposit",
        amount: validated.amount,
        balance_after: newBalance,
        recorded_by: recordedBy,
        notes: typeof body.description === "string" ? body.description : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txnErr) throw txnErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Deposit Recorded",
      entityType: "transaction",
      entityId: txn.id,
      metadata: { user_id: validated.user_id, account_type: validated.account_type, amount: validated.amount },
    });

    await supabase.from("notifications").insert({
      user_id: validated.user_id,
      type: "general",
      title: "Deposit received",
      message: `A deposit of ${validated.amount} XAF was recorded to your ${validated.account_type} account.`,
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
