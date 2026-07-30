import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validatePagination } from "../_shared/validators.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabase = getServiceClient();

    // Authorization: the caller may only read their own transactions.
    // Admins may read anyone's (or all, when no user_id is supplied).
    const authHeader = req.headers.get("Authorization");
    const callerId = authHeader ? extractUserId(authHeader) : null;
    if (!callerId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid Authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { data: adminRow } = await supabase
      .from("admins")
      .select("id, is_active")
      .eq("id", callerId)
      .maybeSingle();
    const isAdmin = !!(adminRow && adminRow.is_active);

    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get("user_id");
    // Non-admins are always scoped to their own id, whatever they request.
    const user_id = isAdmin ? requestedUserId : callerId;
    const account_type = url.searchParams.get("account_type");
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const { page: p, limit: l } = validatePagination(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    const from = (p - 1) * l;
    const to = from + l - 1;

    let query = supabase
      .from("transactions")
      .select("*, accounts!inner(id, account_type, user_id)", { count: "exact" });

    if (user_id) {
      query = query.eq("accounts.user_id", user_id);
    }
    if (account_type) {
      query = query.eq("accounts.account_type", account_type);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const transactions = (data ?? []).map((txn: any) => ({
      id: txn.id,
      account_id: txn.account_id,
      account_type: txn.accounts?.account_type ?? null,
      type: txn.type,
      amount: txn.amount,
      balance_after: txn.balance_after,
      notes: txn.notes,
      recorded_by: txn.recorded_by,
      created_at: txn.created_at,
    }));

    return new Response(
      JSON.stringify({ success: true, transactions, total: count, page: p, limit: l }),
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
