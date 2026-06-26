import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";

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
    const supabase = getServiceClient();

    const body = await req.json();

    if (!body.user_id || typeof body.user_id !== "string") {
      throw new Error("user_id is required and must be a string");
    }
    if (!body.tontine_id || typeof body.tontine_id !== "string") {
      throw new Error("tontine_id is required and must be a string");
    }

    const { data, error } = await supabase
      .from("tontine_join_requests")
      .insert({
        user_id: body.user_id,
        tontine_id: body.tontine_id,
        status: "Pending",
        created_at: new Date().toISOString(),
        created_by: authHeader ? extractUserId(authHeader) : null,
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
      JSON.stringify({ success: true, request: data }),
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
