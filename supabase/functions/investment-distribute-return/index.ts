import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateInvestmentDistribution } from "../_shared/validators.ts";
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
    const validated = validateInvestmentDistribution(body);

    const { data: entry, error: entryErr } = await supabase
      .from("investment_portfolio")
      .select("id, user_id, current_value, returns, status")
      .eq("id", validated.portfolio_id)
      .maybeSingle();
    if (entryErr) throw entryErr;
    if (!entry) throw new Error("Portfolio entry not found");

    const { data: account, error: acctErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", entry.user_id)
      .eq("account_type", "investment")
      .maybeSingle();
    if (acctErr) throw acctErr;
    if (!account) throw new Error("Member has no investment account");

    const accountBalance = Number(account.balance);
    if (validated.kind === "loss" && accountBalance < validated.amount) {
      throw new Error("Amount exceeds the member's investment balance");
    }

    const signedAmount = validated.kind === "profit" ? validated.amount : -validated.amount;
    const newCurrentValue = Math.max(0, Number(entry.current_value) + signedAmount);
    const newReturns = Number(entry.returns) + signedAmount;
    const newAccountBalance = accountBalance + signedAmount;

    const { error: updateEntryErr } = await supabase
      .from("investment_portfolio")
      .update({ current_value: newCurrentValue, returns: newReturns })
      .eq("id", entry.id);
    if (updateEntryErr) throw updateEntryErr;

    const { error: updateAcctErr } = await supabase
      .from("accounts")
      .update({ balance: newAccountBalance })
      .eq("id", account.id);
    if (updateAcctErr) throw updateAcctErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: validated.kind === "profit" ? "deposit" : "withdrawal",
        amount: validated.amount,
        balance_after: newAccountBalance,
        recorded_by: caller.id,
        notes: validated.kind === "profit" ? "Investment return distributed" : "Investment loss recorded",
      })
      .select()
      .single();
    if (txnErr) throw txnErr;

    const distributionNotes = validated.kind === "profit" ? "Investment return distributed" : "Investment loss recorded";
    const { error: historyErr } = await supabase
      .from("investment_returns_history")
      .insert({
        portfolio_id: entry.id,
        amount: signedAmount,
        notes: distributionNotes,
      });
    if (historyErr) throw historyErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: validated.kind === "profit" ? "Investment Return Distributed" : "Investment Loss Recorded",
      entityType: "investment_portfolio",
      entityId: entry.id,
      metadata: { user_id: entry.user_id, amount: validated.amount, kind: validated.kind, transaction_id: txn.id },
    });

    await supabase.from("notifications").insert({
      user_id: entry.user_id,
      type: "general",
      title: validated.kind === "profit" ? "Investment return recorded" : "Investment loss recorded",
      message: validated.kind === "profit"
        ? `A return of ${validated.amount} XAF was added to your investment.`
        : `A loss of ${validated.amount} XAF was recorded against your investment.`,
    });

    return new Response(
      JSON.stringify({ success: true, transaction: txn, current_value: newCurrentValue, returns: newReturns }),
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
