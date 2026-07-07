import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
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
    const callerId = authHeader ? extractUserId(authHeader) : null;
    if (!callerId) throw new Error("Missing or invalid Authorization token");

    const supabase = getServiceClient();
    await assertNotInMaintenance(supabase);
    const body = await req.json();

    if (!body.goal_id || typeof body.goal_id !== "string") {
      throw new Error("goal_id is required and must be a string");
    }
    if (typeof body.amount !== "number" || body.amount <= 0) {
      throw new Error("amount is required and must be a positive number");
    }

    const { data: goal, error: goalErr } = await supabase
      .from("savings_goals")
      .select("id, user_id, account_id, name, target_amount, current_amount, status")
      .eq("id", body.goal_id)
      .maybeSingle();
    if (goalErr) throw goalErr;
    if (!goal) throw new Error("Savings goal not found");
    if (goal.user_id !== callerId) throw new Error("You do not own this savings goal");
    if (goal.status !== "active") throw new Error("This savings goal is not active");

    let accountId = goal.account_id as string | null;
    if (!accountId) {
      const { data: account, error: acctErr } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", callerId)
        .eq("account_type", "savings")
        .maybeSingle();
      if (acctErr) throw acctErr;
      if (!account) throw new Error("No savings account found for this member");
      accountId = account.id;
    }

    const { data: account, error: acctFetchErr } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("id", accountId)
      .single();
    if (acctFetchErr) throw acctFetchErr;

    const newBalance = Number(account.balance) + body.amount;

    const { error: balErr } = await supabase.from("accounts").update({ balance: newBalance }).eq("id", accountId);
    if (balErr) throw balErr;

    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .insert({
        account_id: accountId,
        type: "deposit",
        amount: body.amount,
        balance_after: newBalance,
        recorded_by: null,
        goal_id: goal.id,
        notes: `Goal contribution: ${goal.name}`,
      })
      .select()
      .single();
    if (txnErr) throw txnErr;

    const newCurrentAmount = Number(goal.current_amount) + body.amount;
    const newStatus = newCurrentAmount >= Number(goal.target_amount) ? "completed" : goal.status;

    const { data: updatedGoal, error: updateGoalErr } = await supabase
      .from("savings_goals")
      .update({ current_amount: newCurrentAmount, status: newStatus, account_id: accountId })
      .eq("id", goal.id)
      .select()
      .single();
    if (updateGoalErr) throw updateGoalErr;

    await supabase.from("audit_logs").insert({
      actor_id: callerId,
      action: "Goal Contribution Recorded",
      entity_type: "savings_goal",
      entity_id: goal.id,
      metadata: { amount: body.amount, transaction_id: txn.id },
    });

    if (newStatus === "completed" && goal.status !== "completed") {
      await supabase.from("notifications").insert({
        user_id: callerId,
        type: "general",
        title: "Savings goal completed",
        message: `Congratulations! You've reached your goal "${goal.name}".`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, transaction: txn, goal: updatedGoal }),
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
