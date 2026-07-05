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
    if (member.status !== "pending") throw new Error("Only pending applicants can be rejected");

    const { error: updateErr } = await supabase
      .from("tontine_members")
      .update({ status: "removed" })
      .eq("id", member.id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Tontine Member Rejected",
      entityType: "tontine_member",
      entityId: member.id,
      metadata: { tontine_id: member.tontine_id, user_id: member.user_id, reason: validated.reason ?? null },
    });

    await supabase.from("notifications").insert({
      user_id: member.user_id,
      type: "general",
      title: "Tontine application rejected",
      message: validated.reason
        ? `Your application to join the tontine was rejected: ${validated.reason}`
        : "Your application to join the tontine was rejected.",
    });

    return new Response(
      JSON.stringify({ success: true }),
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
