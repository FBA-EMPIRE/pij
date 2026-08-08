import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateTransactionRequestId } from "../_shared/validators.ts";
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
    const { request_id } = validateTransactionRequestId(body);

    const { data: request, error: reqErr } = await supabase
      .from("transaction_requests")
      .select("id, user_id, type, account_type, amount, status")
      .eq("id", request_id)
      .maybeSingle();
    if (reqErr) throw reqErr;
    if (!request) throw new Error("Request not found");
    if (request.status !== "Pending") throw new Error("Only pending requests can be approved");

    const { data: account, error: acctErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", request.user_id)
      .eq("account_type", request.account_type)
      .maybeSingle();
    if (acctErr) throw acctErr;
    if (!account) throw new Error("Account not found for this member and account type");

    const currentBalance = Number(account.balance);
    if (request.type === "withdrawal" && currentBalance < request.amount) {
      throw new Error("Member has insufficient balance for this withdrawal");
    }

    const newBalance = request.type === "deposit"
      ? currentBalance + Number(request.amount)
      : currentBalance - Number(request.amount);

    const { error: updateAcctErr } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id);
    if (updateAcctErr) throw updateAcctErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: request.type,
        amount: request.amount,
        balance_after: newBalance,
        recorded_by: caller.id,
        notes: request.type === "deposit" ? "Member deposit request approved" : "Member withdrawal request approved",
      })
      .select()
      .single();
    if (txnErr) throw txnErr;

    const { error: updateReqErr } = await supabase
      .from("transaction_requests")
      .update({ status: "Approved", reviewed_by: caller.id, reviewed_at: new Date().toISOString() })
      .eq("id", request.id);
    if (updateReqErr) throw updateReqErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: request.type === "deposit" ? "Deposit Request Approved" : "Withdrawal Request Approved",
      entityType: "transaction_request",
      entityId: request.id,
      metadata: { user_id: request.user_id, account_type: request.account_type, amount: request.amount, transaction_id: txn.id },
    });

    await supabase.from("notifications").insert({
      user_id: request.user_id,
      type: "general",
      title: request.type === "deposit" ? "Deposit approved" : "Withdrawal approved",
      message: `Your ${request.type} request of ${request.amount} XAF was approved and applied to your ${request.account_type} account.`,
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
