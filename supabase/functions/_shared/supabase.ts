import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseClient(authHeader: string | null) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }

  if (cachedClient && !authHeader) {
    return cachedClient;
  }

  const options: Parameters<typeof createClient>[2] = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  };

  if (!authHeader) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, options);
    return cachedClient;
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

export function extractUserId(authHeader: string): string | null {
  try {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const decoded = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decoded);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function isServiceRoleKey(authHeader: string): boolean {
  try {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;

    const decoded = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decoded);
    return payload.role === "service_role";
  } catch {
    return false;
  }
}
