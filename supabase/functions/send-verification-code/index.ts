import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return json({ success: false, error: "Valid email is required" });
    }

    const supabase = getServiceClient();
    const normalizedEmail = email.toLowerCase();

    // Invalidate any existing unused codes for this email
    await supabase
      .from("verification_codes")
      .update({ used_at: new Date(0).toISOString() })
      .eq("email", normalizedEmail)
      .is("used_at", null);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const { error: insertError } = await supabase
      .from("verification_codes")
      .insert({ email: normalizedEmail, code, expires_at: expiresAt.toISOString() });

    if (insertError) {
      return json({ success: false, error: insertError.message });
    }

    // Return code and expiry to the frontend — the browser sends the email via EmailJS
    return json({
      success: true,
      code,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message });
  }
});
