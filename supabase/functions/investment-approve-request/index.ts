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
      .select("id, user_id, opportunity_id, amount, status")
      .eq("id", validated.request_id)
      .maybeSingle();
    if (reqErr) throw reqErr;
    if (!request) throw new Error("Investment request not found");
    if (request.status !== "Pending") throw new Error("Only pending requests can be approved");

    const { data: currentAccount, error: currentErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", request.user_id)
      .eq("account_type", "current")
      .maybeSingle();
    if (currentErr) throw currentErr;
    if (!currentAccount) throw new Error("Member has no current account to fund this investment from");

    const currentBalance = Number(currentAccount.balance);
    if (currentBalance < request.amount) {
      throw new Error("Member has insufficient available balance for this investment");
    }

    let { data: investmentAccount, error: investErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", request.user_id)
      .eq("account_type", "investment")
      .maybeSingle();
    if (investErr) throw investErr;
    if (!investmentAccount) {
      const { data: created, error: createErr } = await supabase
        .from("accounts")
        .insert({ user_id: request.user_id, account_type: "investment", balance: 0 })
        .select("id, balance")
        .single();
      if (createErr) throw createErr;
      investmentAccount = created;
    }

    const newCurrentBalance = currentBalance - request.amount;
    const newInvestmentBalance = Number(investmentAccount.balance) + request.amount;

    const { error: debitErr } = await supabase
      .from("accounts")
      .update({ balance: newCurrentBalance })
      .eq("id", currentAccount.id);
    if (debitErr) throw debitErr;

    const { error: creditErr } = await supabase
      .from("accounts")
      .update({ balance: newInvestmentBalance })
      .eq("id", investmentAccount.id);
    if (creditErr) throw creditErr;

    await supabase.from("transactions").insert({
      account_id: currentAccount.id,
      type: "withdrawal",
      amount: request.amount,
      balance_after: newCurrentBalance,
      recorded_by: caller.id,
      notes: "Investment funded",
    });

    const { data: investTxn, error: investTxnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: investmentAccount.id,
        type: "deposit",
        amount: request.amount,
        balance_after: newInvestmentBalance,
        recorded_by: caller.id,
        notes: "Investment funded",
      })
      .select()
      .single();
    if (investTxnErr) throw investTxnErr;

    const { data: portfolioEntry, error: portfolioErr } = await supabase
      .from("investment_portfolio")
      .insert({
        user_id: request.user_id,
        opportunity_id: request.opportunity_id,
        amount: request.amount,
        current_value: request.amount,
        returns: 0,
        status: "Active",
      })
      .select()
      .single();
    if (portfolioErr) throw portfolioErr;

    const { error: updateReqErr } = await supabase
      .from("investment_requests")
      .update({ status: "Approved", reviewed_by: caller.id, reviewed_at: new Date().toISOString() })
      .eq("id", request.id);
    if (updateReqErr) throw updateReqErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Investment Approved",
      entityType: "investment_portfolio",
      entityId: portfolioEntry.id,
      metadata: { request_id: request.id, user_id: request.user_id, amount: request.amount, transaction_id: investTxn.id },
    });

    await supabase.from("notifications").insert({
      user_id: request.user_id,
      type: "general",
      title: "Investment approved",
      message: `Your investment request of ${request.amount} XAF has been approved and funded.`,
    });

    return new Response(
      JSON.stringify({ success: true, portfolio: portfolioEntry }),
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
