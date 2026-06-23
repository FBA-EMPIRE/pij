import { getSupabaseClient, extractUserId, isServiceRoleKey } from "../_shared/supabase-client.ts";
import { validateTontineGroup } from "../_shared/validators.ts";

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
    const validated = validateTontineGroup(body);

    let adminId = authHeader ? extractUserId(authHeader) : null;
    if (!adminId && authHeader && isServiceRoleKey(authHeader)) {
      adminId = body.admin_id ?? null;
    }
    if (!adminId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: tontine, error } = await supabase
      .from("tontines")
      .insert({
        type_id: validated.type_id,
        name: validated.name,
        capacity: validated.capacity,
        frequency: validated.frequency,
        entry_fee: validated.entry_fee,
        start_date: validated.start_date,
        created_by: adminId,
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
      JSON.stringify({ success: true, tontine }),
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
