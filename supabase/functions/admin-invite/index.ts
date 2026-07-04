import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateAdminInvite } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, logAudit } from "../_shared/admin-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const INVITATION_TTL_DAYS = 7;

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
    const invite = validateAdminInvite(body);

    const { data: role, error: roleErr } = await supabase
      .from("roles")
      .select("id")
      .eq("name", invite.role)
      .single();
    if (roleErr) throw roleErr;

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: invitation, error: insertErr } = await supabase
      .from("admin_invitations")
      .insert({
        email: invite.email,
        role_id: (role as any).id,
        token,
        status: "Pending",
        created_by: caller.id,
        expires_at: expiresAt,
        first_name: invite.firstName,
        last_name: invite.lastName,
        phone: invite.phone ?? null,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Invitation Sent",
      entityType: "admin_invitation",
      entityId: (invitation as any).id,
      metadata: { email: invite.email, role: invite.role },
    });

    return new Response(
      JSON.stringify({ success: true, invitation }),
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
