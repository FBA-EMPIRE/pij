import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateConsultationCreate } from "../_shared/validators.ts";
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

    const body = await req.json();
    const validated = validateConsultationCreate(body);

    const supabase = getServiceClient();

    let dupeQuery = supabase
      .from("consultation_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");
    if (validated.formation_id) dupeQuery = dupeQuery.eq("formation_id", validated.formation_id);
    if (validated.course_id) dupeQuery = dupeQuery.eq("course_id", validated.course_id);
    const { count: dupeCount, error: dupeErr } = await dupeQuery;
    if (dupeErr) throw dupeErr;
    if ((dupeCount ?? 0) > 0) {
      throw new Error("You already have a pending consultation request for this");
    }

    const { data: consultation, error } = await supabase
      .from("consultation_requests")
      .insert({
        user_id: userId,
        type: validated.type,
        project: validated.project,
        need: validated.need,
        formation_id: validated.formation_id ?? null,
        course_id: validated.course_id ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, consultation }),
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
