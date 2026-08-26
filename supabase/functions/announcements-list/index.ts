import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ANNOUNCEMENT_TYPES = ["formation", "tontine", "investment", "general"];
const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 10, 1), 50);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
    const type = url.searchParams.get("type");
    if (type && !ANNOUNCEMENT_TYPES.includes(type)) {
      throw new Error(`type must be one of: ${ANNOUNCEMENT_TYPES.join(", ")}`);
    }

    const supabase = getServiceClient();
    const nowIso = new Date().toISOString();

    let query = supabase
      .from("announcements")
      .select("*, author:admins(email, first_name, last_name)", { count: "exact" })
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (type) query = query.eq("type", type);

    const { data, error, count } = await query;
    if (error) throw error;

    // Only the 'formation' reference target has a defined shape today --
    // tontine/investment references are returned as bare ids.
    const formationIds = Array.from(
      new Set((data ?? []).filter((a) => a.type === "formation" && a.reference_id).map((a) => a.reference_id as string)),
    );
    const formationsById = new Map<string, { title: string; title_en: string | null }>();
    if (formationIds.length) {
      const { data: formations, error: formationsErr } = await supabase
        .from("formations")
        .select("id, title, title_en")
        .in("id", formationIds);
      if (formationsErr) throw formationsErr;
      for (const f of formations ?? []) {
        formationsById.set(f.id, { title: f.title, title_en: f.title_en });
      }
    }

    const result = (data ?? []).map((a) => {
      // deno-lint-ignore no-explicit-any
      const author = (a as any).author;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        type: a.type,
        reference_id: a.reference_id,
        reference: a.type === "formation" && a.reference_id ? (formationsById.get(a.reference_id) ?? null) : null,
        author: {
          email: author?.email ?? null,
          name: author ? `${author.first_name} ${author.last_name}`.trim() : null,
          type: a.author_type,
        },
        is_active: a.is_active,
        published_at: a.published_at,
        expires_at: a.expires_at,
        created_at: a.created_at,
      };
    });

    return json({ success: true, data: result, total: count ?? result.length, limit, offset }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message }, 400);
  }
});
