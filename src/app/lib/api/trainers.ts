import { supabase } from "../supabase/client";
import { invokeEdgeFunction } from "./edgeFunction";
import type { FormateurRequest, FormateurRequestDocument } from "../../types";

export interface FormateurActionResult {
  success: boolean;
  error?: string;
}

export interface PendingFormateurRequest extends FormateurRequest {
  users: { email: string; profiles: { first_name: string; last_name: string } | null } | null;
  formateur_request_documents: FormateurRequestDocument[];
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

  // Goes through the formateur-request-submit Edge Function (not a direct
  // RLS insert like the old message-only version) because it now also
  // coordinates uploading 1-3 supporting documents and writing their rows
  // -- see corrective_implementation_plan.md Phase 3.
  submitRequest: async (params: {
    name: string;
    email: string;
    category: string;
    message?: string;
    files: File[];
  }): Promise<FormateurActionResult> => {
    const form = new FormData();
    form.set("name", params.name);
    form.set("email", params.email);
    form.set("category", params.category);
    if (params.message) form.set("message", params.message);
    for (const file of params.files) form.append("files", file);

    const result = await invokeEdgeFunction<{ request: FormateurRequest }>("formateur-request-submit", { body: form });
    if (!result.success) return { success: false, error: result.error || "Unknown error" };
    return { success: true };
  },

  myRequests: async (): Promise<FormateurRequest[]> => {
    const { data, error } = await supabase
      .from("formateur_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FormateurRequest[];
  },

  listPendingRequests: async (): Promise<PendingFormateurRequest[]> => {
    const { data, error } = await supabase
      .from("formateur_requests")
      .select("*, users(email, profiles(first_name, last_name)), formateur_request_documents(*)")
      .eq("status", "pending").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PendingFormateurRequest[];
  },

  approveRequest: (requestId: string, adminNotes?: string) =>
    reviewFormateurRequest("formateur-request-approve", requestId, adminNotes),
  rejectRequest: (requestId: string, adminNotes?: string) =>
    reviewFormateurRequest("formateur-request-reject", requestId, adminNotes),

  // The admin's own session can call this directly -- the
  // formateur-applications bucket's read RLS policy already grants
  // is_admin() access, no Edge Function needed just to view a document.
  getDocumentUrl: async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("formateur-applications")
      .createSignedUrl(storagePath, 300);
    if (error) throw error;
    return data.signedUrl;
  },
};
