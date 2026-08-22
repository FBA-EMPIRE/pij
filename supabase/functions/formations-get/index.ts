import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { isTrainer, isAdmin } from "../_shared/role-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("id query parameter is required");

    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;

    const supabase = getServiceClient();
    const { data: formation, error } = await supabase
      .from("formations")
      .select(
        "*, creator:admins(first_name, last_name, email), formation_categories(*, formation_courses(*, formation_content(*)))",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;

    if (!formation) {
      return new Response(
        JSON.stringify({ success: false, error: "Formation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (formation.status !== "Published") {
      const isOwner = userId === formation.created_by;
      const elevated = userId ? (await isTrainer(authHeader, userId)) || (await isAdmin(authHeader, userId)) : false;
      if (!isOwner && !elevated) {
        return new Response(
          JSON.stringify({ success: false, error: "This formation is not published" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { count: consultationsCount, error: countErr } = await supabase
      .from("consultation_requests")
      .select("id", { count: "exact", head: true })
      .eq("formation_id", id);
    if (countErr) throw countErr;

    return new Response(
      JSON.stringify({ success: true, formation, consultations_count: consultationsCount ?? 0 }),
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
