import { supabase } from "../supabase/client";

export interface FormateurActionResult {
  success: boolean;
  error?: string;
}

async function callAssignFormateur(userId: string, action: "assign" | "revoke"): Promise<FormateurActionResult> {
  const { data, error } = await supabase.functions.invoke("admin-assign-formateur", {
    body: { user_id: userId, action },
  });
  if (error || !data?.success) {
    return { success: false, error: data?.error || error?.message || "Unknown error" };
  }
  return { success: true };
}

export const trainerService = {
  assign: (userId: string) => callAssignFormateur(userId, "assign"),
  revoke: (userId: string) => callAssignFormateur(userId, "revoke"),
};
