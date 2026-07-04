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
    const { email, code } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return json({ success: false, error: "Valid email is required" });
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      return json({ success: false, error: "A 6-digit code is required" });
    }

    const supabase = getServiceClient();
    const normalizedEmail = email.toLowerCase();

    const { data, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      return json({ success: false, error: fetchError.message });
    }

    if (!data) {
      return json({ success: false, error: "Code invalide ou expiré" });
    }

    await supabase
      .from("verification_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", data.id);

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (user?.id) {
      const { error: adminError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true },
      );

      if (adminError) {
        console.error("Failed to confirm user email:", adminError.message);
      }
    }

    return json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ success: false, error: message });
  }
});
