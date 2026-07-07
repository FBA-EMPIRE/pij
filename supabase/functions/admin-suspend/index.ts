import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateAdminId } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, countActiveSuperAdmins, logAudit } from "../_shared/admin-auth.ts";
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
    requireSuperAdmin(caller);

    const body = await req.json();
    const { admin_id } = validateAdminId(body);

    const { data: target, error: targetErr } = await supabase
      .from("admins")
      .select("id, roles(name)")
      .eq("id", admin_id)
      .maybeSingle();
    if (targetErr) throw targetErr;
    if (!target) throw new Error("Admin not found");

    if ((target as any).roles?.name === "super_admin") {
      const activeSuperAdmins = await countActiveSuperAdmins(supabase);
      if (activeSuperAdmins <= 1) {
        throw new Error("Cannot suspend the last active super admin");
      }
    }

    const { error: updateErr } = await supabase
      .from("admins")
      .update({ is_active: false })
      .eq("id", admin_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Suspended",
      entityType: "admin",
      entityId: admin_id,
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
