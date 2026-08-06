// One-off admin script: permanently delete a user from Supabase Auth.
//
// Usage:
//   node scripts/delete-user.mjs <email> [userId]
//
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY from .env
// in the project root. Requires the service role key, so never commit
// its output or run it against a project you don't administer.
//
// Before deleting, clears kyc_documents.reviewed_by for any rows that
// reference this user's admins.id, since that FK has no ON DELETE
// CASCADE/SET NULL and would otherwise block the cascade delete from
// auth.users -> public.admins.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv(join(__dirname, "..", ".env"));
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const targetEmail = process.argv[2];
const knownUserId = process.argv[3];

if (!targetEmail) {
  console.error("Usage: node scripts/delete-user.mjs <email> [userId]");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email, hintId) {
  if (hintId) {
    const { data, error } = await supabase.auth.admin.getUserById(hintId);
    if (!error && data?.user?.email?.toLowerCase() === email.toLowerCase()) {
      return data.user;
    }
  }
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function clearRef(table, column, adminId) {
  const { data: rows, error: selErr } = await supabase
    .from(table)
    .select("id")
    .eq(column, adminId);
  if (selErr) throw selErr;

  if (!rows || rows.length === 0) {
    console.log(`No ${table} rows reference this admin via ${column}.`);
    return;
  }

  console.log(`Clearing ${table}.${column} on ${rows.length} row(s)...`);
  const { error: updErr } = await supabase
    .from(table)
    .update({ [column]: null })
    .eq(column, adminId);
  if (updErr) throw updErr;
  console.log("Cleared.");
}

async function main() {
  console.log(`Looking up ${targetEmail}...`);
  const user = await findUserByEmail(targetEmail, knownUserId);

  if (!user) {
    console.log("No matching user found in auth.users. Nothing to delete.");
    return;
  }

  console.log(`Found user id=${user.id} email=${user.email} created_at=${user.created_at}`);

  const { data: adminRow } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (adminRow) {
    console.log("User has an admins row — clearing dependent FK refs first.");
    const refs = [
      ["kyc_documents", "reviewed_by"],
      ["transactions", "recorded_by"],
      ["tontine_types", "created_by"],
      ["tontines", "created_by"],
      ["tontine_rounds", "recorded_by"],
      ["tontine_contributions", "recorded_by"],
      ["investment_opportunities", "created_by"],
      ["investment_requests", "reviewed_by"],
      ["admin_invitations", "created_by"],
    ];
    for (const [table, column] of refs) {
      await clearRef(table, column, user.id);
    }
  }

  console.log("Deleting from auth.users...");
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Delete failed:", deleteError.message ?? deleteError);
    process.exit(1);
  }

  console.log("Delete call succeeded. Verifying...");
  const { data: verify, error: verifyError } = await supabase.auth.admin.getUserById(user.id);
  if (!verifyError && verify?.user) {
    console.error("User still present after delete — something went wrong.");
    process.exit(1);
  }

  console.log(`SUCCESS: ${targetEmail} (${user.id}) has been permanently deleted from auth.users.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
