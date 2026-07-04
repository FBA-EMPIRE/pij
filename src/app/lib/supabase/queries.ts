import { supabase } from "./client";

export async function fetchTransactions(userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts!inner(id, account_type, user_id)")
    .eq("accounts.user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((txn: any) => ({
    id: txn.id,
    account_id: txn.account_id,
    account_type: txn.accounts?.account_type ?? null,
    type: txn.type,
    amount: txn.amount,
    balance_after: txn.balance_after,
    notes: txn.notes,
    created_at: txn.created_at,
  }));
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

export interface KycQueueDocument {
  id: string;
  document_type: string;
  storage_path: string;
  submitted_at: string;
}

export interface KycQueueEntry {
  user_id: string;
  uid: string;
  email: string;
  phone: string;
  name: string;
  submitted_at: string;
  documents: KycQueueDocument[];
}

// One applicant can have multiple pending kyc_documents rows (ID front/back,
// selfie); group them into a single queue entry per applicant instead of
// showing duplicate rows for the same person.
export async function fetchKycQueue(): Promise<KycQueueEntry[]> {
  const { data, error } = await supabase
    .from("kyc_documents")
    .select("*, users!inner(uid, email, phone, profiles(first_name, last_name))")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw error;

  const byUser = new Map<string, KycQueueEntry>();
  for (const doc of (data ?? []) as any[]) {
    if (!byUser.has(doc.user_id)) {
      const profile = doc.users?.profiles;
      const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (doc.users?.email ?? "Unknown");
      byUser.set(doc.user_id, {
        user_id: doc.user_id,
        uid: doc.users?.uid ?? doc.user_id,
        email: doc.users?.email ?? "",
        phone: doc.users?.phone ?? "",
        name: name || "Unknown",
        submitted_at: doc.submitted_at,
        documents: [],
      });
    }
    byUser.get(doc.user_id)!.documents.push({
      id: doc.id,
      document_type: doc.document_type,
      storage_path: doc.storage_path,
      submitted_at: doc.submitted_at,
    });
  }
  return Array.from(byUser.values());
}

export async function getKycDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("kyc-documents").createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function requestKycMoreInfo({ user_id, message }: { user_id: string; message: string }) {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id,
    type: "kyc_status",
    title: "Additional information required",
    message,
  });
  if (notifErr) throw notifErr;

  await supabase.from("audit_logs").insert({
    actor_id: currentUser?.id ?? null,
    action: "KYC More Info Requested",
    entity_type: "user",
    entity_id: user_id,
    metadata: { message },
  });
}

export async function kycApprove({ user_id, note }: { user_id: string; note?: string }) {
  const { data, error } = await supabase.functions.invoke("kyc-approve", {
    body: { user_id, reason: note },
  });
  if (error) throw error;
  return data;
}

export async function kycReject({ user_id, note }: { user_id: string; note?: string }) {
  const { data, error } = await supabase.functions.invoke("kyc-reject", {
    body: { user_id, reason: note },
  });
  if (error) throw error;
  return data;
}

export async function fetchDashboardStats() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const [
    { count: totalMembers, error: mErr },
    { count: activeMembers },
    { count: tontineCount, error: tErr },
    { count: activeTontines },
    { count: totalParticipants },
    { data: kycRows },
    { data: savingsAccounts, error: sErr },
    { data: currentAccounts },
    { data: contributionsThisMonth },
    { count: thisMonthMembers },
    { count: lastMonthMembers },
    { data: activeTontinePools },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tontines").select("id", { count: "exact", head: true }),
    supabase.from("tontines").select("id", { count: "exact", head: true }).in("status", ["open", "active"]),
    supabase.from("tontine_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("kyc_status"),
    supabase.from("accounts").select("balance").eq("account_type", "savings"),
    supabase.from("accounts").select("balance").eq("account_type", "current"),
    supabase.from("tontine_contributions").select("amount").eq("status", "paid").gte("paid_at", startOfThisMonth),
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", startOfThisMonth),
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", startOfLastMonth).lt("created_at", startOfThisMonth),
    supabase.from("tontines").select("capacity, tontine_types(contribution_amount)").in("status", ["open", "active"]),
  ]);
  if (mErr || tErr || sErr) throw mErr || tErr || sErr;

  const tontinePoolTotal = (activeTontinePools ?? []).reduce(
    (sum: number, t: any) => sum + Number(t.capacity ?? 0) * Number(t.tontine_types?.contribution_amount ?? 0),
    0,
  );

  const totalSavings = (savingsAccounts ?? []).reduce((sum: number, a: any) => sum + Number(a.balance ?? 0), 0);
  const totalCurrent = (currentAccounts ?? []).reduce((sum: number, a: any) => sum + Number(a.balance ?? 0), 0);
  const tontineContributions = (contributionsThisMonth ?? []).reduce((sum: number, c: any) => sum + Number(c.amount ?? 0), 0);

  const submittedKyc = (kycRows ?? []).filter((u: any) => u.kyc_status !== "not_submitted");
  const approvedKyc = submittedKyc.filter((u: any) => u.kyc_status === "approved");
  const kycApprovalRate = submittedKyc.length ? Math.round((approvedKyc.length / submittedKyc.length) * 100) : 0;

  const monthlyGrowth = (lastMonthMembers ?? 0) > 0
    ? Math.round((((thisMonthMembers ?? 0) - (lastMonthMembers ?? 0)) / (lastMonthMembers as number)) * 1000) / 10
    : (thisMonthMembers ?? 0) > 0 ? 100 : 0;

  return {
    // legacy camelCase fields (LandingPage, AdminDashboard, SuperAdminDashboard)
    memberCount: totalMembers ?? 0,
    tontineCount: tontineCount ?? 0,
    totalSavings,
    // snake_case fields (AdminReports)
    total_members: totalMembers ?? 0,
    active_members: activeMembers ?? 0,
    kyc_approval_rate: kycApprovalRate,
    total_savings: totalSavings,
    total_current: totalCurrent,
    tontine_contributions: tontineContributions,
    monthly_growth: monthlyGrowth,
    active_tontines: activeTontines ?? 0,
    total_participants: totalParticipants ?? 0,
    tontine_pool_total: tontinePoolTotal,
  };
}

function lastNMonths(n: number) {
  const now = new Date();
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ start, end, label: start.toLocaleString("en", { month: "short" }) });
  }
  return months;
}

export async function fetchMemberGrowthTrend() {
  const months = lastNMonths(6);
  const { data, error } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", months[0].start.toISOString());
  if (error) throw error;
  const rows = data ?? [];
  return months.map((m) => ({
    month: m.label,
    members: rows.filter((r: any) => {
      const d = new Date(r.created_at);
      return d >= m.start && d < m.end;
    }).length,
  }));
}

export async function fetchContributionTrend() {
  const months = lastNMonths(6);
  const { data, error } = await supabase
    .from("tontine_contributions")
    .select("amount, paid_at")
    .eq("status", "paid")
    .gte("paid_at", months[0].start.toISOString());
  if (error) throw error;
  const rows = data ?? [];
  return months.map((m) => ({
    month: m.label,
    amount: rows
      .filter((r: any) => r.paid_at && new Date(r.paid_at) >= m.start && new Date(r.paid_at) < m.end)
      .reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0),
  }));
}

export async function fetchKycTrend() {
  const months = lastNMonths(6);
  const { data, error } = await supabase
    .from("kyc_documents")
    .select("user_id, status, reviewed_at")
    .in("status", ["approved", "rejected"])
    .gte("reviewed_at", months[0].start.toISOString());
  if (error) throw error;
  const rows = data ?? [];
  return months.map((m) => {
    const inMonth = rows.filter((r: any) => r.reviewed_at && new Date(r.reviewed_at) >= m.start && new Date(r.reviewed_at) < m.end);
    const approvedUsers = new Set(inMonth.filter((r: any) => r.status === "approved").map((r: any) => r.user_id));
    const rejectedUsers = new Set(inMonth.filter((r: any) => r.status === "rejected").map((r: any) => r.user_id));
    return { month: m.label, approved: approvedUsers.size, rejected: rejectedUsers.size };
  });
}

// ---------------------------------------------------------------------
// Formations
// ---------------------------------------------------------------------

export async function fetchFormationCategories() {
  const { data, error } = await supabase.from("formation_categories").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function saveFormationCategory(category: Record<string, unknown>) {
  const { id, ...fields } = category as { id?: string; [key: string]: unknown };
  if (id) {
    const { data, error } = await supabase.from("formation_categories").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("formation_categories").insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFormationCategory(id: string) {
  const { error } = await supabase.from("formation_categories").delete().eq("id", id);
  if (error) throw error;
}

// Admins see every course regardless of status; members only see Published ones.
export async function fetchFormationCourses(opts: { publishedOnly?: boolean } = {}) {
  let query = supabase.from("formation_courses").select("*, formation_categories(name, name_en, color)");
  if (opts.publishedOnly) query = query.eq("status", "Published");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveFormationCourse(course: Record<string, unknown>) {
  const { id, ...fields } = course as { id?: string; [key: string]: unknown };
  if (id) {
    const { data, error } = await supabase.from("formation_courses").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("formation_courses").insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFormationCourse(id: string) {
  const { error } = await supabase.from("formation_courses").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchFormationContent(courseId?: string) {
  let query = supabase.from("formation_content").select("*");
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query.order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function saveFormationContent(item: Record<string, unknown>) {
  const { id, ...fields } = item as { id?: string; [key: string]: unknown };
  if (id) {
    const { data, error } = await supabase.from("formation_content").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("formation_content").insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFormationContent(id: string) {
  const { error } = await supabase.from("formation_content").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadFormationAsset(file: File, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("formation-assets").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("formation-assets").getPublicUrl(path).data.publicUrl;
}

export async function fetchSystemSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase.from("system_settings").select("key, value");
  if (error) throw error;
  const settings: Record<string, any> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return settings;
}

export async function saveSystemSetting(key: string, value: unknown) {
  const { error } = await supabase.from("system_settings").upsert({ key, value });
  if (error) throw error;
}

export async function fetchTontineStatusCounts() {
  const { data, error } = await supabase.from("tontines").select("status");
  if (error) throw error;
  const counts: Record<string, number> = { open: 0, active: 0, closed: 0 };
  for (const t of (data ?? []) as any[]) {
    if (t.status in counts) counts[t.status]++;
  }
  return counts;
}

export async function fetchTontineContributionRates() {
  const { data: tontines, error } = await supabase
    .from("tontines")
    .select("id, name, capacity")
    .in("status", ["open", "active"]);
  if (error) throw error;

  const results = [];
  for (const t of (tontines ?? []) as any[]) {
    const { data: latestRound } = await supabase
      .from("tontine_rounds")
      .select("id")
      .eq("tontine_id", t.id)
      .order("round_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    let paid = 0;
    if (latestRound) {
      const { count } = await supabase
        .from("tontine_contributions")
        .select("id", { count: "exact", head: true })
        .eq("round_id", (latestRound as any).id)
        .eq("status", "paid");
      paid = count ?? 0;
    }
    const rate = t.capacity ? Math.round((paid / t.capacity) * 100) : 0;
    results.push({ id: t.id, name: t.name, rate, paid, total: t.capacity });
  }
  return results;
}

export async function fetchAdminInvitations() {
  const { data, error } = await supabase.functions.invoke("admin-invitations");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTontines() {
  const [{ data, error }, { data: counts }] = await Promise.all([
    supabase
      .from("tontines")
      .select("*, tontine_types(name, contribution_amount)")
      .order("created_at", { ascending: false }),
    supabase.rpc("get_tontine_member_counts"),
  ]);
  if (error) throw error;
  const countByTontine = new Map((counts ?? []).map((c: any) => [c.tontine_id, c.member_count]));
  return (data ?? []).map((t: any) => ({ ...t, member_count: countByTontine.get(t.id) ?? 0 }));
}

export async function fetchTontineById(id: string) {
  const { data, error } = await supabase
    .from("tontines")
    .select("*, tontine_types(name, contribution_amount)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTontineMembers(tontineId: string) {
  const { data, error } = await supabase
    .from("tontine_members")
    .select("*, users(id, email, profiles(first_name, last_name))")
    .eq("tontine_id", tontineId)
    .order("payout_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m: any) => {
    const profile = m.users?.profiles;
    const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (m.users?.email ?? "User");
    return {
      ...m,
      position: m.payout_order,
      payout_received: m.has_received_payout,
      users: { id: m.users?.id, email: m.users?.email, name, full_name: name },
    };
  });
}

export async function fetchTontineContributionCounts(tontineId: string) {
  const { data: rounds, error: roundsErr } = await supabase
    .from("tontine_rounds")
    .select("id")
    .eq("tontine_id", tontineId);
  if (roundsErr) throw roundsErr;
  const roundIds = (rounds ?? []).map((r: any) => r.id);
  const totalRounds = roundIds.length;

  if (roundIds.length === 0) return { totalRounds: 0, paidByMember: new Map<string, number>() };

  const { data: contributions, error: contribErr } = await supabase
    .from("tontine_contributions")
    .select("member_id, round_id")
    .in("round_id", roundIds)
    .eq("status", "paid");
  if (contribErr) throw contribErr;

  const paidByMember = new Map<string, number>();
  for (const c of (contributions ?? []) as any[]) {
    paidByMember.set(c.member_id, (paidByMember.get(c.member_id) ?? 0) + 1);
  }
  return { totalRounds, paidByMember };
}

export async function contributeToGoal({ goal_id, amount }: { goal_id: string; amount: number }) {
  const { data, error } = await supabase.functions.invoke("goal-contribute", {
    body: { goal_id, amount },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || "Failed to record contribution");
  return data;
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

export async function fetchAccountsWithUsers() {
  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select("user_id, account_type, balance");
  if (accErr) throw accErr;

  const { data: users, error: usrErr } = await supabase
    .from("users")
    .select("*, profiles(first_name, last_name)");
  if (usrErr) throw usrErr;

  const balanceMap: Record<string, { current: number; savings: number }> = {};
  for (const a of accounts ?? []) {
    if (!balanceMap[a.user_id]) balanceMap[a.user_id] = { current: 0, savings: 0 };
    if (a.account_type === "current") balanceMap[a.user_id].current += Number(a.balance ?? 0);
    else if (a.account_type === "savings") balanceMap[a.user_id].savings += Number(a.balance ?? 0);
  }

  return (users ?? []).map((u: any) => {
    const name = [u.profiles?.first_name, u.profiles?.last_name].filter(Boolean).join(" ") || u.email || "Unknown";
    const b = balanceMap[u.id] || { current: 0, savings: 0 };
    return { ...u, ...b, name, kyc: u.kyc_status };
  });
}
