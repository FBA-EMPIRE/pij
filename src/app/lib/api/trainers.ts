import { supabase } from "../supabase/client";
import type { FormateurRequest } from "../../types";

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

async function reviewFormateurRequest(
  fn: "formateur-request-approve" | "formateur-request-reject",
  requestId: string,
  adminNotes?: string,
): Promise<FormateurActionResult> {
  const { data, error } = await supabase.functions.invoke(fn, {
    body: { request_id: requestId, admin_notes: adminNotes },
  });
  if (error || !data?.success) {
    return { success: false, error: data?.error || error?.message || "Unknown error" };
  }
  return { success: true };
}

export const trainerService = {
  assign: (userId: string) => callAssignFormateur(userId, "assign"),
  revoke: (userId: string) => callAssignFormateur(userId, "revoke"),

  // Client submits their own request directly (RLS-permitted insert, no
  // Edge Function needed -- same pattern as consultation_requests).
  submitRequest: async (message: string): Promise<FormateurActionResult> => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };
    const { error } = await supabase.from("formateur_requests").insert({ user_id: userId, message });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  myRequests: async (): Promise<FormateurRequest[]> => {
    const { data, error } = await supabase
      .from("formateur_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FormateurRequest[];
  },

  listPendingRequests: async (): Promise<FormateurRequest[]> => {
    const { data, error } = await supabase
      .from("formateur_requests").select("*, users(email, profiles(first_name, last_name))")
      .eq("status", "pending").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FormateurRequest[];
  },

  approveRequest: (requestId: string, adminNotes?: string) =>
    reviewFormateurRequest("formateur-request-approve", requestId, adminNotes),
  rejectRequest: (requestId: string, adminNotes?: string) =>
    reviewFormateurRequest("formateur-request-reject", requestId, adminNotes),
};
