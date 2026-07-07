// deno-lint-ignore no-explicit-any
type AnyClient = any;

export async function getSystemSetting<T>(supabase: AnyClient, key: string, fallback: T): Promise<T> {
  const { data } = await supabase.from("system_settings").select("value").eq("key", key).maybeSingle();
  return data ? (data.value as T) : fallback;
}

export async function assertNotInMaintenance(supabase: AnyClient) {
  const maintenanceMode = await getSystemSetting<boolean>(supabase, "maintenance_mode", false);
  if (maintenanceMode) {
    throw new Error("The platform is currently in maintenance mode. Please try again later.");
  }
}
