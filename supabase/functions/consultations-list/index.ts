import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validatePagination } from "../_shared/validators.ts";
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
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) throw new Error("Missing or invalid Authorization token");

    const url = new URL(req.url);
    const formationId = url.searchParams.get("formation_id");
    const status = url.searchParams.get("status");
    const { page, limit } = validatePagination(
      url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
      url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getServiceClient();
    const [trainer, admin] = await Promise.all([isTrainer(authHeader, userId), isAdmin(authHeader, userId)]);

    let query = supabase
      .from("consultation_requests")
      .select("*, users(email, profiles(first_name, last_name)), course:formation_courses(title, title_en)", {
        count: "exact",
      });

    if (admin) {
      // sees everything
    } else if (trainer) {
      const { data: owned, error: ownedErr } = await supabase
        .from("formations")
        .select("id")
        .eq("created_by", userId);
      if (ownedErr) throw ownedErr;
      const formationIds = (owned ?? []).map((f) => f.id);
      if (formationIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, consultations: [], total: 0, page, limit }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      query = query.in("formation_id", formationIds);
    } else {
      query = query.eq("user_id", userId);
    }

    if (formationId) query = query.eq("formation_id", formationId);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, consultations: data ?? [], total: count ?? 0, page, limit }),
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
