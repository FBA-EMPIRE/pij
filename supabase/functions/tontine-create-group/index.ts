import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateTontineGroup } from "../_shared/validators.ts";
import { getCallerAdmin, logAudit } from "../_shared/admin-auth.ts";
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

    const body = await req.json();
    const validated = validateTontineGroup(body);

    const { data, error } = await supabase
      .from("tontines")
      .insert({
        type_id: validated.type_id,
        name: validated.name,
        capacity: validated.capacity,
        frequency: validated.frequency,
        entry_fee: validated.entry_fee,
        start_date: validated.start_date,
        status: "open",
        created_by: caller.id,
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

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Tontine Created",
      entityType: "tontine",
      entityId: data.id,
      metadata: { name: validated.name, capacity: validated.capacity },
    });

    return new Response(
      JSON.stringify({ success: true, group: data }),
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
