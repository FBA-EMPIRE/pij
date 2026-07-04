import { getServiceClient } from "../_shared/supabase-client.ts";
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

    const { data: invitation, error } = await supabase
      .from("admin_invitations")
      .select("email, status, expires_at, first_name, last_name, roles(name)")
      .eq("token", body.token)
      .maybeSingle();
    if (error) throw error;

    if (!invitation || invitation.status !== "Pending" || new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "This invitation is invalid or has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitation: {
          email: invitation.email,
          role: (invitation as any).roles?.name ?? "admin",
          first_name: invitation.first_name,
          last_name: invitation.last_name,
        },
      }),
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
