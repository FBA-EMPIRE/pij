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

    const [trainer, admin] = userId
      ? await Promise.all([isTrainer(authHeader, userId), isAdmin(authHeader, userId)])
      : [false, false];

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    // The task calls this "trainer_id"; the real column is formations.created_by.
    const trainerId = url.searchParams.get("trainer_id");
    const search = url.searchParams.get("search");
    const { page, limit } = validatePagination(
      url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
      url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getServiceClient();
    let query = supabase
      .from("formations")
      .select("*, creator:admins(first_name, last_name, email), formation_courses(count)", { count: "exact" });

    if (admin) {
      // Admins/super_admins see everything; an explicit status filter narrows it.
      if (status) query = query.eq("status", status);
    } else if (trainer && userId) {
      // Trainers see all published formations plus their own drafts/archives.
      query = query.or(`status.eq.Published,created_by.eq.${userId}`);
      if (status) query = query.eq("status", status);
    } else {
      query = query.eq("status", "Published");
    }

    if (trainerId) query = query.eq("created_by", trainerId);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;

    // formation_courses(count) comes back as an embedded aggregate array
    // ([{ count: N }]) -- flatten it into a plain course_count field.
    const formations = (data ?? []).map((f) => {
      // deno-lint-ignore no-explicit-any
      const row = f as any;
      const { formation_courses, ...rest } = row;
      return { ...rest, course_count: formation_courses?.[0]?.count ?? 0 };
    });

    return new Response(
      JSON.stringify({ success: true, formations, total: count ?? 0, page, limit }),
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
