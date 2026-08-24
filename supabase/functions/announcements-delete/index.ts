import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateAnnouncementDelete } from "../_shared/validators.ts";
import { getCallerRole } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST" && req.method !== "DELETE") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? extractUserId(authHeader) : null;
    if (!userId) {
      return json({ success: false, error: "Missing or invalid Authorization token" }, 401);
    }

    const body = await req.json();
    const { announcement_id } = validateAnnouncementDelete(body);

    const supabase = getServiceClient();

    const { data: announcement, error: fetchErr } = await supabase
      .from("announcements")
      .select("id, author_id, is_active")
      .eq("id", announcement_id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!announcement) {
      return json({ success: false, error: "Announcement not found" }, 404);
    }

    const role = await getCallerRole(userId);
    const isElevated = role === "admin" || role === "super_admin";
    const isAuthor = announcement.author_id === userId;
    if (!isElevated && !isAuthor) {
      return json({ success: false, error: "Not authorized to delete this announcement" }, 403);
    }

    const { error: updateErr } = await supabase
      .from("announcements")
      .update({ is_active: false })
      .eq("id", announcement_id);
    if (updateErr) throw updateErr;

    await logAudit(supabase, {
      actorId: userId,
      action: "Announcement Deleted",
      entityType: "announcement",
      entityId: announcement_id,
    });

    return json({ success: true, message: "Announcement deleted successfully" }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message }, 400);
  }
});
