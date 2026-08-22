// Authorization helpers for the Formation module.
//
// Ownership model: formations.created_by references admins(id) (there is
// no separate trainer_id column). A "trainer" is an admins row whose role
// is 'formateur'; 'admin' and 'super_admin' roles can manage any formation
// regardless of who created it.
import { getServiceClient } from "./supabase-client.ts";

interface AdminInfo {
  id: string;
  role: string;
  isActive: boolean;
}

async function getAdminInfo(userId: string): Promise<AdminInfo | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id, is_active, roles(name)")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // deno-lint-ignore no-explicit-any
  const row = data as any;
  return { id: row.id, role: row.roles?.name ?? "", isActive: !!row.is_active };
}

function hasElevatedAccess(admin: AdminInfo | null): boolean {
  return !!admin && admin.isActive && (admin.role === "admin" || admin.role === "super_admin");
}

export async function isTrainer(_authHeader: string | null, userId: string): Promise<boolean> {
  const admin = await getAdminInfo(userId);
  return !!admin && admin.isActive && admin.role === "formateur";
}

export async function isSuperAdmin(_authHeader: string | null, userId: string): Promise<boolean> {
  const admin = await getAdminInfo(userId);
  return !!admin && admin.isActive && admin.role === "super_admin";
}

export async function isAdmin(_authHeader: string | null, userId: string): Promise<boolean> {
  return hasElevatedAccess(await getAdminInfo(userId));
}

export async function canManageFormation(
  _authHeader: string | null,
  formationId: string,
  userId: string,
): Promise<boolean> {
  const admin = await getAdminInfo(userId);
  if (!admin || !admin.isActive) return false;
  if (hasElevatedAccess(admin)) return true;
  if (admin.role !== "formateur") return false;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("formations")
    .select("created_by")
    .eq("id", formationId)
    .maybeSingle();
  if (error) throw error;
  return !!data && data.created_by === userId;
}

export async function canManageCourse(
  _authHeader: string | null,
  courseId: string,
  userId: string,
): Promise<boolean> {
  const admin = await getAdminInfo(userId);
  if (!admin || !admin.isActive) return false;
  if (hasElevatedAccess(admin)) return true;
  if (admin.role !== "formateur") return false;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("formation_courses")
    .select("id, formation_categories(formation_id, formations(created_by))")
    .eq("id", courseId)
    .maybeSingle();
  if (error) throw error;
  // deno-lint-ignore no-explicit-any
  const createdBy = (data as any)?.formation_categories?.formations?.created_by;
  return !!createdBy && createdBy === userId;
}
