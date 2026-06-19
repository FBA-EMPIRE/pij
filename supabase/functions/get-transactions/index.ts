import { getServiceClient } from "../_shared/supabase-client.ts";
import { validatePagination } from "../_shared/validators.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
    const authHeader = req.headers.get("Authorization");
    const supabase = getServiceClient();

    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id");
    const account_type = url.searchParams.get("account_type");
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const { page: p, limit: l } = validatePagination(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    const from = (p - 1) * l;
    const to = from + l - 1;

    let query = supabase.from("transactions").select("*", { count: "exact" });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }
    if (account_type) {
      query = query.eq("account_type", account_type);
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

    return new Response(
      JSON.stringify({ success: true, transactions: data, total: count, page: p, limit: l }),
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
