import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateAnnouncementCreate, validateAnnouncementBulkCreate } from "../_shared/validators.ts";
import { getCallerRole } from "../_shared/role-check.ts";
import { logAudit } from "../_shared/admin-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface ItemResult {
  success: boolean;
  announcement?: unknown;
  error?: string;
  input: unknown;
}

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
    if (role !== "admin" && role !== "super_admin") {
      return json({ success: false, error: "Only admins can bulk-create announcements" }, 403);
    }

    const body = await req.json();
    const { items } = validateAnnouncementBulkCreate(body);

    const supabase = getServiceClient();
    const results: ItemResult[] = [];

    for (const item of items) {
      try {
        const validated = validateAnnouncementCreate(item);

        if (validated.type === "formation" && validated.reference_id) {
          const { data: formation, error: formationErr } = await supabase
            .from("formations")
            .select("id")
            .eq("id", validated.reference_id)
            .maybeSingle();
          if (formationErr) throw formationErr;
          if (!formation) throw new Error("Formation not found");
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

        results.push({ success: true, announcement, input: item });
      } catch (itemErr) {
        results.push({
          success: false,
          error: itemErr instanceof Error ? itemErr.message : "Failed to create announcement",
          input: item,
        });
      }
    }

    const created = results.filter((r) => r.success).length;
    const failed = results.length - created;

    if (created > 0) {
      await logAudit(supabase, {
        actorId: userId,
        action: "Announcements Bulk Created",
        entityType: "announcement",
        metadata: { created, failed },
      });
    }

    return json({ success: true, created, failed, results }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message }, 400);
  }
});
