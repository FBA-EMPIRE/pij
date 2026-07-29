import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateInvestmentAdjustment } from "../_shared/validators.ts";
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
    const validated = validateInvestmentAdjustment(body);

    let { data: account, error: acctErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", validated.user_id)
      .eq("account_type", "investment")
      .maybeSingle();
    if (acctErr) throw acctErr;

    if (!account) {
      if (validated.action === "debit") {
        throw new Error("This member has no investment account to debit from");
      }
      const { data: created, error: createErr } = await supabase
        .from("accounts")
        .insert({ user_id: validated.user_id, account_type: "investment", balance: 0 })
        .select("id, balance")
        .single();
      if (createErr) throw createErr;
      account = created;
    }

    const currentBalance = Number(account.balance);
    if (validated.action === "debit" && currentBalance < validated.amount) {
      throw new Error("Insufficient investment balance");
    }

    const newBalance = validated.action === "credit"
      ? currentBalance + validated.amount
      : currentBalance - validated.amount;

    const { error: updateErr } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id);
    if (updateErr) throw updateErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: validated.action === "credit" ? "deposit" : "withdrawal",
        amount: validated.amount,
        balance_after: newBalance,
        recorded_by: caller.id,
        notes: `Admin wallet ${validated.action}`,
      })
      .select()
      .single();
    if (txnErr) throw txnErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: validated.action === "credit" ? "Investment Wallet Credited" : "Investment Wallet Debited",
      entityType: "transaction",
      entityId: txn.id,
      metadata: { user_id: validated.user_id, amount: validated.amount, action: validated.action },
    });

    await supabase.from("notifications").insert({
      user_id: validated.user_id,
      type: "general",
      title: validated.action === "credit" ? "Investment wallet credited" : "Investment wallet debited",
      message: `Your investment wallet was ${validated.action === "credit" ? "credited" : "debited"} ${validated.amount} XAF by an administrator.`,
    });

    return new Response(
      JSON.stringify({ success: true, transaction: txn, balance: newBalance }),
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
