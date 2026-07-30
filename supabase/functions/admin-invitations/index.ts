import { getServiceClient } from "../_shared/supabase-client.ts";
import { getCallerAdmin, requireSuperAdmin } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getServiceClient();

    const caller = await getCallerAdmin(authHeader, supabase);
    requireSuperAdmin(caller);

    await supabase
      .from("admin_invitations")
      .update({ status: "Expired" })
      .eq("status", "Pending")
      .lt("expires_at", new Date().toISOString());

    const { data, error } = await supabase
      .from("admin_invitations")
      .select("id, email, status, sent_at, expires_at, token, roles(name)")
      .order("sent_at", { ascending: false });
    if (error) throw error;

    const invitations = (data ?? []).map((inv: any) => ({
      id: inv.id,
      email: inv.email,
      role: inv.roles?.name ?? "admin",
      status: inv.status,
      sent_at: inv.sent_at,
      expires_at: inv.expires_at,
      token: inv.token,
    }));

    return new Response(
      JSON.stringify(invitations),
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
