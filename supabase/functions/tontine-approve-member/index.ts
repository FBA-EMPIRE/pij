import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateTontineMemberAction } from "../_shared/validators.ts";
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
    const validated = validateTontineMemberAction(body);

    const { data: member, error: memberErr } = await supabase
      .from("tontine_members")
      .select("id, tontine_id, user_id, status")
      .eq("id", validated.member_id)
      .maybeSingle();

    if (memberErr) throw memberErr;
    if (!member) throw new Error("Tontine member not found");
    if (member.status !== "pending") throw new Error("Only pending applicants can be approved");

    const { data: tontine, error: tontineErr } = await supabase
      .from("tontines")
      .select("id, capacity, status")
      .eq("id", member.tontine_id)
      .single();
    if (tontineErr) throw tontineErr;

    const { data: activeMembers, error: activeErr } = await supabase
      .from("tontine_members")
      .select("payout_order")
      .eq("tontine_id", member.tontine_id)
      .eq("status", "active");
    if (activeErr) throw activeErr;

    if (activeMembers.length >= tontine.capacity) {
      throw new Error("This tontine has already reached its capacity");
    }

    const nextPayoutOrder = activeMembers.reduce(
      (max, m) => Math.max(max, m.payout_order ?? 0),
      0,
    ) + 1;

    const { data: updated, error: updateErr } = await supabase
      .from("tontine_members")
      .update({ status: "active", payout_order: nextPayoutOrder })
      .eq("id", member.id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    const newActiveCount = activeMembers.length + 1;
    let tontineClosed = false;
    if (newActiveCount >= tontine.capacity && tontine.status === "open") {
      const { error: closeErr } = await supabase
        .from("tontines")
        .update({ status: "active" })
        .eq("id", tontine.id);
      if (closeErr) throw closeErr;
      tontineClosed = true;
    }

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Tontine Member Approved",
      entityType: "tontine_member",
      entityId: member.id,
      metadata: { tontine_id: member.tontine_id, user_id: member.user_id, payout_order: nextPayoutOrder },
    });

    await supabase.from("notifications").insert({
      user_id: member.user_id,
      type: "general",
      title: "Tontine application approved",
      message: "Your application to join the tontine has been approved. You can now view its evolution and payment tours.",
    });

    return new Response(
      JSON.stringify({ success: true, member: updated, tontineClosed }),
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
