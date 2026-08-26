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

    let res: Response;
    try {
      res = await fetch(url, { method, headers, body: requestBody });
    } catch (fetchErr) {
      // The browser's own "Failed to fetch" / "NetworkError" -- thrown
      // before any HTTP response exists, so res.status is never seen.
      // Almost always means: the function isn't deployed at this project
      // (a 404 from Supabase's gateway carries no CORS headers, which the
      // browser reports as this same generic failure), a CORS mismatch,
      // or no network/DNS reachability. Logged with the exact URL so it's
      // immediately checkable in the Network tab or via a manual curl.
      console.error(`[invokeEdgeFunction] ${method} ${url} failed before a response was received`, fetchErr);
      throw fetchErr;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const message = json?.error || `Request failed (${res.status})`;
      console.error(`[invokeEdgeFunction] ${method} ${url} -> ${res.status}`, { message, body: json });
      return { success: false, error: message };
    }
    return { success: true, data: json as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error(`[invokeEdgeFunction] ${name} threw:`, err);
    return { success: false, error: message };
  }
}
