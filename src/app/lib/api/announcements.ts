// API service for the Announcements Edge Functions (announcements-create/
// -list/-delete/-bulk-create). Field names match what announcements-list
// actually returns: author is a resolved {email, name, type} object (not
// a raw author_id), and reference is only populated for type "formation"
// (announcements-list has no defined shape for tontine/investment
// references yet, so those come back with reference: null).
import { invokeEdgeFunction } from "./edgeFunction";

export type AnnouncementType = "formation" | "tontine" | "investment" | "general";

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  type: AnnouncementType;
  reference_id: string | null;
  reference: { title: string; title_en: string | null } | null;
  author: {
    email: string | null;
    name: string | null;
    type: string;
  };
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface AnnouncementCreateInput {
  title: string;
  description?: string;
  type: AnnouncementType;
  reference_id?: string;
  expires_at?: string;
}

export interface AnnouncementListParams {
  type?: AnnouncementType;
  limit?: number;
  offset?: number;
}

export interface AnnouncementBulkItem extends AnnouncementCreateInput {}

export interface AnnouncementBulkResult {
  success: boolean;
  announcement?: Announcement;
  error?: string;
  input: unknown;
}

export const announcementsApi = {
  create: (payload: AnnouncementCreateInput) =>
    invokeEdgeFunction<{ announcement: Announcement }>("announcements-create", { body: payload }),

  list: (params: AnnouncementListParams = {}) =>
    invokeEdgeFunction<{ data: Announcement[]; total: number; limit: number; offset: number }>("announcements-list", {
      method: "GET",
      query: params,
    }),

  remove: (announcementId: string) =>
    invokeEdgeFunction<{ message: string }>("announcements-delete", { body: { announcement_id: announcementId } }),

  bulkCreate: (items: AnnouncementBulkItem[]) =>
    invokeEdgeFunction<{ created: number; failed: number; results: AnnouncementBulkResult[] }>("announcements-bulk-create", {
      body: { items },
    }),
};
