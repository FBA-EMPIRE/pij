// Shared fetch-based caller for Supabase Edge Functions. Extracted out of
// lib/api/formations.ts so other API modules (announcements, etc.) don't
// duplicate the auth/JSON/FormData plumbing.
import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase/client";

const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// `object` (rather than Record<string, unknown>) so any of the specific
// *Input/*Params interfaces in each API module can be passed without an
// index signature.
export async function invokeEdgeFunction<T>(
  name: string,
  opts: { method?: "GET" | "POST"; body?: object | FormData; query?: object } = {},
): Promise<ApiResult<T>> {
  const { method = "POST", body, query } = opts;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? supabaseAnonKey;

    let url = `${FUNCTIONS_URL}/${name}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    };
    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
      requestBody = body;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    const res = await fetch(url, { method, headers, body: requestBody });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || `Request failed (${res.status})` };
    }
    return { success: true, data: json as T };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
