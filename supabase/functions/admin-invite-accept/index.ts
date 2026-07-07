import { getServiceClient } from "../_shared/supabase-client.ts";
import { logAudit } from "../_shared/admin-auth.ts";
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
    const supabase = getServiceClient();
    const body = await req.json();

    if (!body.token || typeof body.token !== "string") {
      throw new Error("token is required and must be a string");
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 8) {
      throw new Error("password is required and must be at least 8 characters");
    }

    const { data: invitation, error: invErr } = await supabase
      .from("admin_invitations")
      .select("id, email, role_id, status, expires_at, first_name, last_name")
      .eq("token", body.token)
      .maybeSingle();
    if (invErr) throw invErr;

    if (!invitation || invitation.status !== "Pending" || new Date(invitation.expires_at) < new Date()) {
      throw new Error("This invitation is invalid or has expired");
    }

    const firstName = invitation.first_name || invitation.email.split("@")[0];
    const lastName = invitation.last_name || "";

    // Reuse an existing auth user for this email if one already exists
    // (e.g. promoting an existing member to admin); otherwise create one.
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", invitation.email)
      .maybeSingle();

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, { password: body.password });
      if (pwErr) throw pwErr;
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: invitation.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    const { error: adminErr } = await supabase
      .from("admins")
      .upsert({
        id: userId,
        role_id: invitation.role_id,
        first_name: firstName,
        last_name: lastName,
        email: invitation.email,
        is_active: true,
      });
    if (adminErr) throw adminErr;

    const { error: updateInvErr } = await supabase
      .from("admin_invitations")
      .update({ status: "Accepted", accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);
    if (updateInvErr) throw updateInvErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Admin Invitation Accepted",
      entityType: "admin",
      entityId: userId,
      metadata: { invitation_id: invitation.id },
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
