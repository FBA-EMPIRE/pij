import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateCourseCreate } from "../_shared/validators.ts";
import { canManageFormation } from "../_shared/role-check.ts";
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
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) throw new Error("Missing or invalid Authorization token");

    const body = await req.json();
    const validated = validateCourseCreate(body);

    if (!(await canManageFormation(authHeader, validated.formation_id, userId))) {
      throw new Error("Not authorized to add courses to this formation");
    }

    const supabase = getServiceClient();

    const insertPayload: Record<string, unknown> = {
      formation_id: validated.formation_id,
      title: validated.title,
    };
    for (const field of ["title_en", "description", "instructor", "duration", "level", "status", "featured", "cover_image_path", "image", "lesson_count"] as const) {
      if (validated[field] !== undefined) insertPayload[field] = validated[field];
    }

    const { data: course, error } = await supabase
      .from("formation_courses")
      .insert(insertPayload)
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Formation Course Created",
      entityType: "formation_course",
      entityId: course.id,
      metadata: { formation_id: validated.formation_id, title: validated.title },
    });

    return new Response(
      JSON.stringify({ success: true, course }),
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
