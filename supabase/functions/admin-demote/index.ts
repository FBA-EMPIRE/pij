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
      .select("id, is_active, roles(name)")
      .eq("id", admin_id)
      .maybeSingle();
    if (targetErr) throw targetErr;
    if (!target) throw new Error("Admin not found");

    const targetRole = (target as any).roles?.name;
    if (targetRole === "super_admin" && (target as any).is_active) {
      const activeSuperAdmins = await countActiveSuperAdmins(supabase);
      if (activeSuperAdmins <= 1) {
        throw new Error("Cannot demote the last active super admin");
      }
    }

    const { data: adminRole, error: roleErr } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();
    if (roleErr) throw roleErr;

    const { error: updateErr } = await supabase
      .from("admins")
      .update({ role_id: (adminRole as any).id })
      .eq("id", admin_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Demoted",
      entityType: "admin",
      entityId: admin_id,
      metadata: { new_role: "admin" },
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
