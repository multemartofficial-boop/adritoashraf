// One-command Supabase setup. Reads .env.local; never prints secrets.
//   1. Runs supabase/schema.sql (Management API, HTTPS)
//   2. Disables public sign-ups + sets Site URL / redirect URLs
//   3. Creates (or updates) the admin user and registers it in public.admins
//   4. Generates CRON_SECRET in .env.local if missing
// Usage: npm run setup:supabase
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const env = process.env;
// Without SUPABASE_ACCESS_TOKEN, steps 1-2 are skipped: run schema.sql in the SQL Editor
// and turn off sign-ups in the dashboard manually, then re-run this script.
const hasToken = Boolean(env.SUPABASE_ACCESS_TOKEN?.startsWith("sbp_"));
const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD", "NEXT_PUBLIC_SITE_URL"];
const missing = required.filter((k) => !env[k] || env[k].includes("your-"));
if (missing.length) {
  console.error(`Fill these in .env.local first: ${missing.join(", ")}`);
  process.exit(1);
}
if (env.ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const api = async (method, path, body) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${(await res.text()).slice(0, 500)}`);
  return res.status === 204 ? null : res.json().catch(() => null);
};
const step = (n, msg) => console.log(`\n[${n}/4] ${msg}`);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (hasToken) {
  step(1, "Importing supabase/schema.sql ...");
  await api("POST", "/database/query", { query: readFileSync(resolve(root, "supabase/schema.sql"), "utf8") });
  console.log("      done");

  step(2, "Locking auth: disabling public sign-ups, setting Site URL ...");
  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  await api("PATCH", "/config/auth", {
    disable_signup: true,
    site_url: site,
    uri_allow_list: [site, `${site}/**`, "http://localhost:3000/**"].join(","),
  });
  console.log("      done");
} else {
  step(1, "No SUPABASE_ACCESS_TOKEN: skipping schema import (run supabase/schema.sql in SQL Editor).");
  step(2, "Skipping auth config (public sign-ups are already blocked by the signup_allowlist trigger).");
  const { error } = await admin.from("admins").select("user_id").limit(1);
  if (error) {
    console.error("\nTables not found. Paste supabase/schema.sql into Supabase SQL Editor, Run, then re-run this script.");
    process.exit(1);
  }
}

step(3, "Creating admin user ...");
const email = env.ADMIN_EMAIL.trim().toLowerCase();
let userId;
const { error: allowErr } = await admin.from("signup_allowlist").upsert({ email }, { onConflict: "email" });
if (allowErr) throw allowErr;
const created = await admin.auth.admin.createUser({ email, password: env.ADMIN_PASSWORD, email_confirm: true });
if (created.error) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!existing) throw created.error;
  userId = existing.id;
  const upd = await admin.auth.admin.updateUserById(userId, { password: env.ADMIN_PASSWORD, email_confirm: true });
  if (upd.error) throw upd.error;
  console.log("      user already existed, password updated");
} else {
  userId = created.data.user.id;
  console.log("      user created");
}
const { error: adminErr } = await admin
  .from("admins")
  .upsert({ user_id: userId, email, name: "Adrito Ashraf" }, { onConflict: "user_id" });
if (adminErr) throw adminErr;
console.log("      registered in public.admins");

step(4, "Checking CRON_SECRET ...");
const envPath = resolve(root, ".env.local");
let file = readFileSync(envPath, "utf8");
if (!env.CRON_SECRET || env.CRON_SECRET.startsWith("change-me") || env.CRON_SECRET.length < 24) {
  const secret = randomBytes(32).toString("hex");
  file = /^CRON_SECRET=.*$/m.test(file)
    ? file.replace(/^CRON_SECRET=.*$/m, `CRON_SECRET=${secret}`)
    : `${file.trimEnd()}\nCRON_SECRET=${secret}\n`;
  writeFileSync(envPath, file);
  console.log("      generated a new CRON_SECRET in .env.local");
} else {
  console.log("      already set");
}

console.log(`
Setup complete. Next:
  - Run: npm run check:supabase
  - Then DELETE these lines from .env.local: SUPABASE_ACCESS_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD
  - Revoke the access token at https://supabase.com/dashboard/account/tokens (it is no longer needed)`);
