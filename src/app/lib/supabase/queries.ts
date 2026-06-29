import { supabase } from "./client";

export async function fetchTransactions(userId: string) {
  const { data, error } = await supabase.functions.invoke("get-transactions", {
    body: { user_id: userId },
  });
  if (error) throw error;
  return data ?? [];
}

export async function recordDeposit({
  user_id,
  amount,
  account_type,
  description,
}: {
  user_id: string;
  amount: number;
  account_type?: string;
  description?: string;
}) {
  const { data, error } = await supabase.functions.invoke("record-deposit", {
    body: { user_id, amount, account_type, description },
  });
  if (error) throw error;
  return data;
}

export async function recordWithdrawal({
  user_id,
  amount,
  account_type,
  description,
}: {
  user_id: string;
  amount: number;
  account_type?: string;
  description?: string;
}) {
  const { data, error } = await supabase.functions.invoke("record-withdrawal", {
    body: { user_id, amount, account_type, description },
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*, profiles(*)")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const profiles = (data as any).profiles;
  const name = profiles ? `${profiles.first_name} ${profiles.last_name}`.trim() : data.email;
  const merged = { ...data, ...profiles, name, id: userId };
  delete merged.profiles;
  return merged;
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*, profiles(first_name, last_name)");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdmins() {
  const { data, error } = await supabase
    .from("admins")
    .select("*, roles(name)");
  if (error) throw error;
  return data ?? [];
}

export async function fetchKycQueue() {
  const { data, error } = await supabase
    .from("kyc_documents")
    .select("*, users!inner(uid, email, phone, profiles(first_name, last_name))")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function kycApprove({ user_id, note }: { user_id: string; note?: string }) {
  const { data, error } = await supabase.functions.invoke("kyc-approve", {
    body: { user_id, note },
  });
  if (error) throw error;
  return data;
}

export async function kycReject({ user_id, note }: { user_id: string; note?: string }) {
  const { data, error } = await supabase.functions.invoke("kyc-reject", {
    body: { user_id, note },
  });
  if (error) throw error;
  return data;
}

export async function fetchDashboardStats() {
  const { data: memberCount, error: mErr } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });
  const { data: tontineCount, error: tErr } = await supabase
    .from("tontines")
    .select("id", { count: "exact", head: true });
  const { data: savingsData, error: sErr } = await supabase
    .from("accounts")
    .select("balance")
    .eq("account_type", "savings");
  if (mErr || tErr) throw mErr || tErr;
  const totalSavings = (savingsData as any[] ?? []).reduce((sum: number, a: any) => sum + Number(a.balance ?? 0), 0);
  return { memberCount: memberCount?.length ?? 0, tontineCount: tontineCount?.length ?? 0, totalSavings };
}

export async function fetchAdminInvitations() {
  const { data, error } = await supabase.functions.invoke("admin-invitations");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTontines() {
  const { data, error } = await supabase
    .from("tontines")
    .select("*, tontine_types(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTontineById(id: string) {
  const { data, error } = await supabase
    .from("tontines")
    .select("*, tontine_types(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTontineMembers(tontineId: string) {
  const { data, error } = await supabase
    .from("tontine_members")
    .select("*, users(id, email, full_name, name)")
    .eq("tontine_id", tontineId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyTontines(userId: string) {
  const { data, error } = await supabase
    .from("tontine_members")
    .select("*, tontines(*, tontine_types(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function applyToTontine({
  user_id,
  tontine_id,
}: {
  user_id: string;
  tontine_id: string;
}) {
  const { data, error } = await supabase.functions.invoke("tontine-apply", {
    body: { user_id, tontine_id },
  });
  if (error) throw error;
  return data;
}

export async function fetchTontineTypes() {
  const { data, error } = await supabase
    .from("tontine_types")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
