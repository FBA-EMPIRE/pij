import { getServiceClient, extractUserId } from "../_shared/supabase-client.ts";
import { validateKycAction } from "../_shared/validators.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getServiceClient();

    const body = await req.json();
    const validated = validateKycAction(body);

    const reviewedBy = authHeader ? extractUserId(authHeader) : null;

    const updateData: Record<string, unknown> = {
      kyc: "Rejected",
      kyc_reviewed_by: reviewedBy,
      kyc_reviewed_at: new Date().toISOString(),
    };
    if (validated.reason) {
      updateData.kyc_rejection_reason = validated.reason;
    }

    const { data, error } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", validated.user_id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, member: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
