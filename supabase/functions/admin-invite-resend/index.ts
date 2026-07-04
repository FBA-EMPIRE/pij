import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateInvitationId } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, logAudit } from "../_shared/admin-auth.ts";
import { sendEmail, adminInviteEmailHtml } from "../_shared/email.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
    const { invitation_id } = validateInvitationId(body);

    const { data: existing, error: fetchErr } = await supabase
      .from("admin_invitations")
      .select("id, status, email, roles(name)")
      .eq("id", invitation_id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Invitation not found");
    if ((existing as any).status === "Revoked" || (existing as any).status === "Accepted") {
      throw new Error(`Cannot resend a ${(existing as any).status.toLowerCase()} invitation`);
    }

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateErr } = await supabase
      .from("admin_invitations")
      .update({ token, status: "Pending", sent_at: new Date().toISOString(), expires_at: expiresAt })
      .eq("id", invitation_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: caller.id,
      action: "Admin Invitation Resent",
      entityType: "admin_invitation",
      entityId: invitation_id,
    });

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";
    const activationUrl = `${appUrl}/admin/invite/${token}`;
    const emailResult = await sendEmail({
      to: (existing as any).email,
      subject: "Your PIJ Administration invitation",
      html: adminInviteEmailHtml({ activationUrl, role: (existing as any).roles?.name ?? "admin", expiresAt }),
    });

    return new Response(
      JSON.stringify({ success: true, emailSent: emailResult.sent, emailError: emailResult.error }),
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
