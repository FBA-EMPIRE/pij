import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { logAudit } from "../_shared/admin-auth.ts";

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

    const callerId = authHeader ? extractUserId(authHeader) : null;
    if (!callerId) throw new Error("Missing or invalid Authorization token");

    const body = await req.json();

    if (!body.tontine_id || typeof body.tontine_id !== "string") {
      throw new Error("tontine_id is required and must be a string");
    }
    // A member may only apply on their own behalf, regardless of what
    // (if anything) the client sends as user_id.
    const userId = callerId;

    const { data, error } = await supabase
      .from("tontine_members")
      .insert({
        tontine_id: body.tontine_id,
        user_id: userId,
        status: "pending",
        joined_at: new Date().toISOString(),
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
      actorId: userId,
      action: "Tontine Application Submitted",
      entityType: "tontine_member",
      entityId: data.id,
      metadata: { tontine_id: body.tontine_id },
    });

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "general",
      title: "Tontine application received",
      message: "Your application to join the tontine has been submitted and is pending approval.",
    });

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
