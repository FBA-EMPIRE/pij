import { extractUserId } from "./supabase.ts";

export interface CallerAdmin {
  id: string;
  role: string;
}

// deno-lint-ignore no-explicit-any
type AnyClient = any;

export async function getCallerAdmin(
  authHeader: string | null,
  supabase: AnyClient,
): Promise<CallerAdmin> {
  if (!authHeader) throw new Error("Missing Authorization header");
  const callerId = extractUserId(authHeader);
  if (!callerId) throw new Error("Invalid Authorization token");

  const { data, error } = await supabase
    .from("admins")
    .select("id, is_active, roles(name)")
    .eq("id", callerId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.is_active) throw new Error("Not an active admin");

  const role = data.roles?.name;
  if (!role) throw new Error("Admin has no assigned role");

  return { id: data.id, role };
}

export function requireSuperAdmin(caller: CallerAdmin) {
  if (caller.role !== "super_admin") {
    throw new Error("Only super admins can perform this action");
  }
}

export async function countActiveSuperAdmins(supabase: AnyClient): Promise<number> {
  const { data, error } = await supabase
    .from("admins")
    .select("id, is_active, roles!inner(name)")
    .eq("is_active", true)
    .eq("roles.name", "super_admin");
  if (error) throw error;
  return (data ?? []).length;
}

export async function logAudit(
  supabase: AnyClient,
  entry: { actorId: string; action: string; entityType: string; entityId?: string; metadata?: Record<string, unknown> },
) {
  await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? null,
  });
}
