import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateAnnouncementCreate } from "../_shared/validators.ts";
import { getCallerRole } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELIGIBLE_ROLES = ["admin", "super_admin", "formateur"];
const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) {
      return json({ success: false, error: "Missing or invalid Authorization token" }, 401);
    }

    const role = await getCallerRole(userId);
    if (!role || !ELIGIBLE_ROLES.includes(role)) {
      return json({ success: false, error: "Not authorized to create announcements" }, 403);
    }

    const body = await req.json();
    const validated = validateAnnouncementCreate(body);
    const isTrainer = role === "formateur";

    // Trainers may only announce their own formations -- any other type
    // (or a formation they don't own) is rejected outright.
    if (isTrainer && validated.type !== "formation") {
      return json({ success: false, error: "Trainers can only create announcements for their own formations" }, 403);
    }

    const supabase = getServiceClient();

    if (validated.type === "formation") {
      const { data: formation, error: formationErr } = await supabase
        .from("formations")
        .select("id, created_by")
        .eq("id", validated.reference_id)
        .maybeSingle();
      if (formationErr) throw formationErr;
      if (!formation) {
        return json({ success: false, error: "Formation not found" }, 404);
      }
      if (isTrainer && formation.created_by !== userId) {
        return json({ success: false, error: "Trainers can only create announcements for their own formations" }, 403);
      }
    }

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({
        title: validated.title,
        description: validated.description,
        type: validated.type,
        reference_id: validated.reference_id,
        author_id: userId,
        author_type: role,
        is_active: true,
        published_at: new Date().toISOString(),
        expires_at: validated.expires_at,
      })
      .select()
      .single();
    if (error) throw error;

    await logAudit(supabase, {
      actorId: userId,
      action: "Announcement Created",
      entityType: "announcement",
      entityId: announcement.id,
      metadata: { type: validated.type, title: validated.title },
    });

    return json({ success: true, announcement }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message }, 400);
  }
});
