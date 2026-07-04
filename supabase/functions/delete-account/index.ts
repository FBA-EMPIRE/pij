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
    const callerId = authHeader ? extractUserId(authHeader) : null;
    if (!callerId) throw new Error("Missing or invalid Authorization token");

    const supabase = getServiceClient();

    await logAudit(supabase, {
      actorId: callerId,
      action: "Account Deletion Requested",
      entityType: "user",
      entityId: callerId,
    });

    // Deleting the auth user cascades to public.users (and everything
    // referencing it: profiles, accounts, savings_goals, tontine_members,
    // notifications, etc.) via the existing "on delete cascade" FKs.
    const { error } = await supabase.auth.admin.deleteUser(callerId);
    if (error) throw error;

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
