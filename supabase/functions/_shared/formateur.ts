// deno-lint-ignore no-explicit-any
type AnyClient = any;

export async function assignFormateurRole(supabase: AnyClient, userId: string) {
  const { data: formateurRole, error: roleErr } = await supabase
    .from("roles").select("id").eq("name", "formateur").single();
  if (roleErr) throw roleErr;
  const formateurRoleId = (formateurRole as any).id;

  const { data: existingAdmin, error: adminLookupErr } = await supabase
    .from("admins").select("id, roles(name)").eq("id", userId).maybeSingle();
  if (adminLookupErr) throw adminLookupErr;

  if (existingAdmin) {
    const currentRole = (existingAdmin as any).roles?.name;
    if (currentRole && currentRole !== "formateur") {
      // Guards against silently downgrading an admin/super_admin who happens to
      // also submit (or be targeted by) a trainer-promotion action.
      throw new Error(`User already holds the '${currentRole}' role; demote them first`);
    }
    const { error } = await supabase.from("admins")
      .update({ role_id: formateurRoleId, is_active: true }).eq("id", userId);
    if (error) throw error;
    return;
  }

  const { data: user, error: userErr } = await supabase
    .from("users").select("email, profiles(first_name, last_name)").eq("id", userId).maybeSingle();
  if (userErr) throw userErr;
  if (!user) throw new Error("User not found");
  const profile = (user as any).profiles;
  const email = (user as any).email as string;

  const { error } = await supabase.from("admins").insert({
    id: userId,
    role_id: formateurRoleId,
    first_name: profile?.first_name || email.split("@")[0],
    last_name: profile?.last_name || "-",
    email,
    is_active: true,
  });
  if (error) throw error;
}

export async function revokeFormateurRole(supabase: AnyClient, userId: string) {
  const { data: existingAdmin, error } = await supabase
    .from("admins").select("id, roles(name)").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!existingAdmin) throw new Error("User is not currently an admin");
  if ((existingAdmin as any).roles?.name !== "formateur") {
    throw new Error("User does not currently hold the formateur role");
  }
  const { error: deleteErr } = await supabase.from("admins").delete().eq("id", userId);
  if (deleteErr) throw deleteErr;
}
