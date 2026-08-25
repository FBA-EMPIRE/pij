// API service for the Formation module Edge Functions.
//
// Field names below match what the deployed Edge Functions actually
// return (the live Postgres schema: formations.created_by, the
// formations -> formation_courses -> formation_content hierarchy, and
// consultation_requests with need/admin_notes) -- not the flatter
// trainer_id/is_paid/order_index/content_type shape originally sketched
// for this module, which doesn't exist in the database. A formation is
// its own grouping now, so formation_categories no longer exists either.
import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase/client";

const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// `object` (rather than Record<string, unknown>) so any of the specific
// *Input/*Params interfaces below can be passed without an index signature.
async function invokeEdgeFunction<T>(
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

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export type FormationStatus = "Draft" | "Published" | "Archived";

export interface Formation {
  id: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  cover_image?: string | null;
  status: FormationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: { first_name: string; last_name: string; email: string } | null;
  formation_courses?: Course[];
  // Only present on formations-list rows (a flattened count, not the full list).
  course_count?: number;
}

export interface Course {
  id: string;
  formation_id: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  instructor?: string | null;
  duration?: string | null;
  lesson_count: number;
  level?: string | null;
  status: FormationStatus;
  progress: number;
  featured: boolean;
  image?: string | null;
  cover_image_path?: string | null;
  created_at: string;
  updated_at: string;
  formation_content?: Content[];
}

export type ContentType = "video" | "pdf" | "external_link";

export interface Content {
  id: string;
  course_id: string;
  type: ContentType;
  title: string;
  duration?: string | null;
  format?: string | null;
  completed: boolean;
  file_name?: string | null;
  file_size?: string | null;
  storage_path?: string | null;
  external_url?: string | null;
  created_at: string;
}

export type ConsultationStatus = "pending" | "approved" | "completed" | "cancelled";

export interface Consultation {
  id: string;
  user_id: string;
  type: string;
  project: string;
  need: string;
  status: ConsultationStatus;
  admin_notes?: string | null;
  formation_id?: string | null;
  course_id?: string | null;
  created_at: string;
  updated_at: string;
  users?: { email: string; profiles?: { first_name: string; last_name: string } | null };
  course?: { title: string; title_en?: string | null };
}

// ---------------------------------------------------------------------
// Formations
// ---------------------------------------------------------------------

export interface FormationCreateInput {
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  cover_image?: string;
  status?: FormationStatus;
}

export interface FormationUpdateInput {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  cover_image?: string;
  status?: FormationStatus;
}

export interface FormationListParams {
  status?: FormationStatus;
  trainer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const formationsApi = {
  create: (payload: FormationCreateInput) =>
    invokeEdgeFunction<{ formation: Formation }>("formations-create", { body: payload }),

  list: (params: FormationListParams = {}) =>
    invokeEdgeFunction<{ formations: Formation[]; total: number; page: number; limit: number }>("formations-list", {
      method: "GET",
      query: params,
    }),

  get: (id: string) =>
    invokeEdgeFunction<{ formation: Formation; consultations_count: number }>("formations-get", {
      method: "GET",
      query: { id },
    }),

  update: (id: string, patch: FormationUpdateInput) =>
    invokeEdgeFunction<{ formation: Formation }>("formations-update", { body: { id, ...patch } }),

  remove: (id: string) => invokeEdgeFunction<Record<string, never>>("formations-delete", { body: { id } }),
};

// ---------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------

export interface CourseCreateInput {
  formation_id: string;
  title: string;
  title_en?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  lesson_count?: number;
  level?: string;
  status?: FormationStatus;
  featured?: boolean;
  cover_image_path?: string;
  image?: string;
}

export interface CourseUpdateInput {
  title?: string;
  title_en?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  lesson_count?: number;
  level?: string;
  status?: FormationStatus;
  featured?: boolean;
  cover_image_path?: string;
  image?: string;
}

export const coursesApi = {
  create: (payload: CourseCreateInput) =>
    invokeEdgeFunction<{ course: Course }>("courses-create", { body: payload }),

  update: (id: string, patch: CourseUpdateInput) =>
    invokeEdgeFunction<{ course: Course }>("courses-update", { body: { id, ...patch } }),

  remove: (id: string) => invokeEdgeFunction<Record<string, never>>("courses-delete", { body: { id } }),
};

// ---------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------

export interface ContentUploadInput {
  course_id: string;
  title: string;
  duration?: string;
  file?: File;
  external_url?: string;
}

export const contentsApi = {
  upload: ({ course_id, title, duration, file, external_url }: ContentUploadInput) => {
    const form = new FormData();
    form.set("course_id", course_id);
    form.set("title", title);
    if (duration) form.set("duration", duration);
    if (file) form.set("file", file);
    if (external_url) form.set("external_url", external_url);
    return invokeEdgeFunction<{ content: Content }>("contents-upload", { body: form });
  },

  remove: (id: string) => invokeEdgeFunction<Record<string, never>>("contents-delete", { body: { id } }),
};

// ---------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------

export interface ConsultationCreateInput {
  type: string;
  need: string;
  project?: string;
  formation_id?: string;
  course_id?: string;
}

export interface ConsultationListParams {
  formation_id?: string;
  status?: ConsultationStatus;
  page?: number;
  limit?: number;
}

export const consultationsApi = {
  create: (payload: ConsultationCreateInput) =>
    invokeEdgeFunction<{ consultation: Consultation }>("consultations-create", { body: payload }),

  list: (params: ConsultationListParams = {}) =>
    invokeEdgeFunction<{ consultations: Consultation[]; total: number; page: number; limit: number }>(
      "consultations-list",
      { method: "GET", query: params },
    ),

  respond: (id: string, response: string, status?: ConsultationStatus) =>
    invokeEdgeFunction<{ consultation: Consultation }>("consultations-respond", {
      body: { id, response, status },
    }),
};
