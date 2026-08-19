import { getServiceClient } from "../_shared/supabase-client.ts";
import { validateFormateurAction } from "../_shared/validators.ts";
import { getCallerAdmin, requireSuperAdmin, logAudit } from "../_shared/admin-auth.ts";
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
    const { user_id, action } = validateFormateurAction(body);

    const { data: formateurRole, error: roleErr } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "formateur")
      .single();
    if (roleErr) throw roleErr;
    const formateurRoleId = (formateurRole as any).id;

    const { data: existingAdmin, error: adminLookupErr } = await supabase
      .from("admins")
      .select("id, roles(name)")
      .eq("id", user_id)
      .maybeSingle();
    if (adminLookupErr) throw adminLookupErr;

    if (action === "assign") {
      if (existingAdmin) {
        const { error: updateErr } = await supabase
          .from("admins")
          .update({ role_id: formateurRoleId, is_active: true })
          .eq("id", user_id);
        if (updateErr) throw updateErr;
      } else {
        const { data: user, error: userErr } = await supabase
          .from("users")
          .select("email, profiles(first_name, last_name)")
          .eq("id", user_id)
          .maybeSingle();
        if (userErr) throw userErr;
        if (!user) throw new Error("User not found");

        const profile = (user as any).profiles;
        const email = (user as any).email as string;

        const { error: insertErr } = await supabase
          .from("admins")
          .insert({
            id: user_id,
            role_id: formateurRoleId,
            first_name: profile?.first_name || email.split("@")[0],
            last_name: profile?.last_name || "-",
            email,
            is_active: true,
          });
        if (insertErr) throw insertErr;
      }

      await logAudit(supabase, {
        actorId: caller.id,
        action: "Formateur Assigned",
        entityType: "user",
        entityId: user_id,
      });
    } else {
      if (!existingAdmin) throw new Error("User is not currently an admin");
      if ((existingAdmin as any).roles?.name !== "formateur") {
        throw new Error("User does not currently hold the formateur role");
      }

      const { error: deleteErr } = await supabase
        .from("admins")
        .delete()
        .eq("id", user_id);
      if (deleteErr) throw deleteErr;

      await logAudit(supabase, {
        actorId: caller.id,
        action: "Formateur Revoked",
        entityType: "user",
        entityId: user_id,
      });
    }

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
