import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { zonedToUtc } from "@/lib/time";
import { BookingsManager, type BookingListItem } from "./bookings-manager";

export const metadata: Metadata = { title: "Bookings" };

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
const RANGES = ["upcoming", "today", "week", "past", "all"] as const;
export type RangeKey = (typeof RANGES)[number];

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === str(sp.status)) ?? "";
  const range: RangeKey = RANGES.find((r) => r === str(sp.range)) ?? (status === "cancelled" || status === "completed" ? "all" : "upcoming");
  const serviceId = /^[0-9a-f-]{36}$/.test(str(sp.service)) ? str(sp.service) : "";
  const q = str(sp.q).trim().slice(0, 80);

  const { data: settings } = await supabase.from("booking_settings").select("timezone").eq("id", 1).maybeSingle();
  const tz = settings?.timezone ?? "Asia/Dhaka";

  // Day boundaries in the admin timezone.
  const now = new Date();
  const todayParts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  const dayStart = (offset: number) => zonedToUtc(todayParts[0], todayParts[1], todayParts[2] + offset, 0, 0, tz).toISOString();

  let query = supabase
    .from("bookings")
    .select(
      "id, reference_code, client_name, email, phone, service_id, project_type, budget_range, timeline_needed, project_description, reference_links, attachment_path, client_timezone, start_time_utc, end_time_utc, status, meeting_link, admin_notes, created_at, cancelled_by",
    )
    .order("start_time_utc", { ascending: range === "past" || range === "all" ? false : true })
    .limit(300);

  if (status) query = query.eq("status", status);
  if (serviceId) query = query.eq("service_id", serviceId);
  if (range === "upcoming") query = query.gte("end_time_utc", now.toISOString());
  if (range === "today") query = query.gte("start_time_utc", dayStart(0)).lt("start_time_utc", dayStart(1));
  if (range === "week") query = query.gte("start_time_utc", dayStart(0)).lt("start_time_utc", dayStart(7));
  if (range === "past") query = query.lt("end_time_utc", now.toISOString());
  if (q) {
    const safe = q.replace(/[%_,()]/g, " ");
    query = query.or(`client_name.ilike.%${safe}%,email.ilike.%${safe}%,reference_code.ilike.%${safe}%`);
  }

  const [{ data: bookings }, { data: services }] = await Promise.all([
    query,
    supabase.from("services").select("id, title").order("sort_order"),
  ]);

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const items: BookingListItem[] = (bookings ?? []).map((b) => ({
    ...b,
    reference_links: Array.isArray(b.reference_links) ? (b.reference_links as string[]) : [],
    service_title: b.service_id ? (serviceMap.get(b.service_id) ?? "Deleted service") : "General enquiry",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description={`Client meetings. Times are shown in ${tz}.`} />
      <BookingsManager
        items={items}
        services={services ?? []}
        timezone={tz}
        filters={{ status, range, service: serviceId, q }}
      />
    </div>
  );
}
