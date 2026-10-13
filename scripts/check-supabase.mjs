// Verifies that supabase/schema.sql was imported correctly and RLS behaves as expected.
// Usage: npm run check:supabase   (reads .env.local)
import { createClient } from "@supabase/supabase-js";

const need = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const opts = { auth: { persistSession: false } };
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, opts);
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, opts);

let failed = 0;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed++;
};

const tables = [
  "admins", "site_settings", "projects", "project_images", "services", "process_steps",
  "testimonials", "faqs", "availability_rules", "blocked_dates", "booking_settings",
  "bookings", "email_templates", "dashboard_state", "rate_limits", "signup_allowlist",
];
for (const t of tables) {
  const { error, count } = await service.from(t).select("*", { count: "exact" }).limit(0);
  const ok = !error && typeof count === "number";
  check(ok, `table ${t}${ok ? ` — ${count} rows` : ` (${error?.message || "missing"})`}`);
}

const { count: projects } = await anon.from("projects").select("*", { count: "exact", head: true });
check((projects ?? 0) >= 4, "anon can read published projects");

const { data: anonBookings } = await anon.from("bookings").select("id").limit(1);
check(!anonBookings || anonBookings.length === 0, "anon cannot read bookings (RLS)");

const { error: anonInsert } = await anon.from("projects").insert({ title: "x", slug: "rls-test" });
check(Boolean(anonInsert), "anon cannot write projects (RLS)");

const { data: settings } = await anon.from("booking_settings").select("*");
check(!settings || settings.length === 0, "anon cannot read booking_settings (RLS)");

const { error: rpcErr } = await anon.rpc("create_booking", { p: {} });
check(Boolean(rpcErr), "anon cannot call create_booking()");

const { data: buckets, error: bErr } = await service.storage.listBuckets();
const ids = (buckets ?? []).map((b) => b.id);
check(!bErr && ids.includes("site-media"), "storage bucket site-media exists");
check(!bErr && ids.includes("booking-attachments"), "storage bucket booking-attachments exists");

const { count: admins } = await service.from("admins").select("*", { count: "exact", head: true });
check((admins ?? 0) >= 1, "at least one admin registered (see supabase/README.md step 4)");

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
