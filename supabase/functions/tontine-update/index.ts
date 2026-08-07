import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateTontineUpdate } from "../_shared/validators.ts";
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
    const { id, patch } = validateTontineUpdate(body);

    const { data: existing, error: fetchErr } = await supabase
      .from("tontines")
      .select("id, name, capacity, frequency, entry_fee, start_date")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Tontine not found");

    if (patch.capacity !== undefined && patch.capacity < existing.capacity) {
      const { count: activeCount, error: countErr } = await supabase
        .from("tontine_members")
        .select("id", { count: "exact", head: true })
        .eq("tontine_id", id)
        .eq("status", "active");
      if (countErr) throw countErr;
      if (patch.capacity < (activeCount ?? 0)) {
        throw new Error(`Cannot set capacity below the current member count (${activeCount})`);
      }
    }

    const { data: updated, error: updateErr } = await supabase
      .from("tontines")
      .update(patch)
      .eq("id", id)
      .select("*, tontine_types(name, contribution_amount)")
      .single();
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Tontine Updated",
      entityType: "tontine",
      entityId: id,
      metadata: { before: existing, patch },
    });

    return new Response(
      JSON.stringify({ success: true, tontine: updated }),
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
