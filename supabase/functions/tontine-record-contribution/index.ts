import { getSupabaseClient, extractUserId } from "../_shared/supabase-client.ts";

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

    if (!body.tontine_id || typeof body.tontine_id !== "string") {
      throw new Error("tontine_id is required and must be a string");
    }
    if (!body.member_id || typeof body.member_id !== "string") {
      throw new Error("member_id is required and must be a string");
    }
    if (typeof body.amount !== "number" || body.amount <= 0) {
      throw new Error("amount is required and must be a positive number");
    }
    if (!Number.isInteger(body.round) || (body.round as number) <= 0) {
      throw new Error("round is required and must be a positive integer");
    }

    const adminId = authHeader ? extractUserId(authHeader) : null;

    const { data, error } = await supabase
      .from("contribution_logs")
      .insert({
        tontine_id: body.tontine_id,
        member_id: body.member_id,
        round: body.round,
        amount: body.amount,
        recorded_by: adminId,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, contribution: data }),
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
