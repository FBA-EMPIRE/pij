import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateAdminId } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, logAudit } from "../_shared/admin-auth.ts";

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

    const caller = await getCallerAdmin(authHeader, supabase);
    requireSuperAdmin(caller);

    const body = await req.json();
    const { admin_id } = validateAdminId(body);

    const { data: superAdminRole, error: roleErr } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "super_admin")
      .single();
    if (roleErr) throw roleErr;

    const { error: updateErr } = await supabase
      .from("admins")
      .update({ role_id: (superAdminRole as any).id })
      .eq("id", admin_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Promoted",
      entityType: "admin",
      entityId: admin_id,
      metadata: { new_role: "super_admin" },
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
