import { getSupabaseClient } from "../_shared/supabase-client.ts";
import { validateGetTransactions, validatePagination } from "../_shared/validators.ts";

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
    const filters = validateGetTransactions(body);
    const { page, limit } = validatePagination(body.page, body.limit);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("transactions")
      .select("*, accounts!inner(user_id, account_type)", { count: "exact" });

    if (filters.user_id) {
      query = query.eq("accounts.user_id", filters.user_id);
    }
    if (filters.account_type) {
      query = query.eq("accounts.account_type", filters.account_type);
    }

    const { data: transactions, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, transactions, page, limit, total: count ?? 0 }),
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
