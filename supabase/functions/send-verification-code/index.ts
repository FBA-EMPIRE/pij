import { getServiceClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    await supabase
      .from("verification_codes")
      .update({ used_at: new Date(0).toISOString() })
      .eq("email", email.toLowerCase())
      .is("used_at", null);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("verification_codes")
      .insert({ email: email.toLowerCase(), code, expires_at: expiresAt });

    if (insertError) {
      return json({ success: false, error: insertError.message });
    }

    console.log(`[DEV] Verification code for ${email}: ${code}`);

    return json({
      success: true,
      message: "Verification code sent",
      dev_code: code,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message });
  }
});
