import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
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
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) throw new Error("Missing or invalid Authorization token");

    const supabase = getServiceClient();

    // Uses the service client (bypasses RLS), so the admin/own-only split
    // has to be enforced here explicitly rather than left to Postgres.
    const { data: adminRow } = await supabase
      .from("admins")
      .select("id, is_active")
      .eq("id", userId)
      .maybeSingle();
    const isAdmin = !!adminRow?.is_active;

    let query = supabase
      .from("loans")
      .select("*, users(email, profiles(first_name, last_name))")
      .order("created_at", { ascending: false });
    if (!isAdmin) query = query.eq("user_id", userId);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, loans: data ?? [] }),
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
