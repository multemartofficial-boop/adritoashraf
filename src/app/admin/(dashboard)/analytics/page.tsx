import type { Metadata } from "next";
import { CalendarCheck, CircleCheck, Percent, Timer } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { zonedParts, zonedToUtc } from "@/lib/time";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { StatsRow, type Stat } from "@/components/admin/stats-row";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusDonut, WeeklyTrendChart, type StatusSlice, type WeekPoint } from "./analytics-charts";

export const metadata: Metadata = { title: "Analytics" };

const PROJECT_TYPE_LABELS: Record<string, string> = {
  website: "Website",
  saas: "SaaS product",
  erp: "ERP / business software",
  hr: "HR system",
  other: "Something else",
};
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Confirmed: "#16a34a",
  Completed: "#64748b",
  Cancelled: "#e11d48",
};
const WEEK_MS = 7 * 86_400_000;

/** Monday (in the admin timezone) of the week containing `iso`, as a YYYY-MM-DD key. */
function weekStartKey(iso: string, tz: string) {
  const d = new Date(iso);
  const p = zonedParts(d, tz);
  const dow = WEEKDAYS.indexOf(new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d));
  const monday = zonedToUtc(p.year, p.month, p.day - ((dow + 6) % 7), 0, 0, tz);
  return monday.toISOString().slice(0, 10);
}

const fmtDay = (ymd: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${ymd}T00:00:00Z`));

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-sm">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className="h-full rounded-full bg-admin-info transition-[width] duration-500"
          style={{ width: `${max ? Math.max((value / max) * 100, 3) : 0}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium">{value}</span>
    </li>
  );
}

export default async function AnalyticsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: settings }, { data: bookings }, { data: services }] = await Promise.all([
    supabase.from("booking_settings").select("timezone").eq("id", 1).maybeSingle(),
    supabase
      .from("bookings")
      .select("status, service_id, project_type, start_time_utc, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("services").select("id, title"),
  ]);
  const tz = settings?.timezone ?? "Asia/Dhaka";
  const all = bookings ?? [];

  // --- KPIs (all time) ---
  const total = all.length;
  const cancelled = all.filter((b) => b.status === "cancelled").length;
  const done = all.filter((b) => b.status === "completed").length;
  const active = total - cancelled;
  const leadDays = all.map((b) => (Date.parse(b.start_time_utc) - Date.parse(b.created_at)) / 86_400_000).filter((d) => d >= 0);
  const avgLead = leadDays.length ? leadDays.reduce((a, b) => a + b, 0) / leadDays.length : 0;

  const stats: Stat[] = [
    { label: "Total Bookings", hint: "Every booking ever received, including cancelled.", value: String(total), icon: CalendarCheck, tone: "info" },
    {
      label: "Completion rate",
      hint: "Share of non-cancelled bookings marked completed.",
      value: active ? `${Math.round((done / active) * 100)}%` : "—",
      unit: "completed",
      icon: CircleCheck,
      tone: "success",
    },
    {
      label: "Cancellation rate",
      hint: "Share of all bookings that were cancelled.",
      value: total ? `${Math.round((cancelled / total) * 100)}%` : "—",
      unit: "cancelled",
      icon: Percent,
      tone: "danger",
    },
    {
      label: "Avg. lead time",
      hint: "Average days between booking submission and the meeting.",
      value: leadDays.length ? `${avgLead.toFixed(1)}` : "—",
      unit: "days",
      icon: Timer,
      tone: "warning",
    },
  ];

  // --- Weekly trend (last 12 weeks, bookings received / created_at) ---
  const nowP = zonedParts(new Date(), tz);
  const todayDow = WEEKDAYS.indexOf(new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date()));
  const firstMonday = zonedToUtc(nowP.year, nowP.month, nowP.day - ((todayDow + 6) % 7) - 7 * 11, 0, 0, tz);
  const weekMap = new Map<string, WeekPoint>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(firstMonday.getTime() + i * WEEK_MS);
    const key = weekStartKey(d.toISOString(), tz);
    weekMap.set(key, { week: fmtDay(key), confirmed: 0, pending: 0, cancelled: 0 });
  }
  for (const b of all) {
    const key = weekStartKey(b.created_at, tz);
    const w = weekMap.get(key);
    if (!w) continue;
    if (b.status === "cancelled") w.cancelled++;
    else if (b.status === "pending") w.pending++;
    else w.confirmed++;
  }
  const weekly = [...weekMap.values()];

  // --- Status donut (all time) ---
  const statusCounts = ["pending", "confirmed", "completed", "cancelled"].map((s) => ({
    name: s[0].toUpperCase() + s.slice(1),
    value: all.filter((b) => b.status === s).length,
  }));
  const donut: StatusSlice[] = statusCounts.filter((s) => s.value > 0).map((s) => ({ ...s, color: STATUS_COLORS[s.name] }));

  // --- Breakdowns ---
  const serviceTitle = new Map((services ?? []).map((s) => [s.id, s.title]));
  const countBy = (key: (b: (typeof all)[number]) => string) => {
    const m = new Map<string, number>();
    for (const b of all) {
      if (b.status === "cancelled") continue;
      const k = key(b);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const byService = countBy((b) => (b.service_id ? (serviceTitle.get(b.service_id) ?? "Deleted service") : "General enquiry"));
  const byType = countBy((b) => PROJECT_TYPE_LABELS[b.project_type] ?? b.project_type);
  const byWeekday = WEEKDAYS.map((label, i) => ({
    label,
    value: all.filter(
      (b) =>
        b.status !== "cancelled" &&
        new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(b.start_time_utc)) === WEEKDAYS[i],
    ).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description={`Booking trends and conversion over time. Days and weeks are counted in ${tz}.`} />

      {total === 0 ? (
        <Panel>
          <EmptyState icon={CalendarCheck} title="No bookings yet" description="Charts will appear here as soon as the first booking arrives." />
        </Panel>
      ) : (
        <>
          <StatsRow stats={stats} />

          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <Panel className="p-5">
              <h2 className="text-sm font-semibold">Bookings received</h2>
              <p className="mb-4 text-xs text-admin-muted">Per week, last 12 weeks — stacked by current status.</p>
              <WeeklyTrendChart data={weekly} />
            </Panel>
            <Panel className="p-5">
              <h2 className="text-sm font-semibold">Status breakdown</h2>
              <p className="mb-4 text-xs text-admin-muted">All bookings by current status.</p>
              <StatusDonut data={donut} />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="p-5">
              <h2 className="text-sm font-semibold">By service</h2>
              <p className="mb-4 text-xs text-admin-muted">Which services get booked (excludes cancelled).</p>
              {byService.length === 0 ? (
                <p className="py-6 text-center text-xs text-admin-muted">No active bookings yet.</p>
              ) : (
                <ul className="space-y-3">
                  {byService.map(([label, v]) => (
                    <BarRow key={label} label={label} value={v} max={byService[0][1]} />
                  ))}
                </ul>
              )}
            </Panel>
            <Panel className="p-5">
              <h2 className="text-sm font-semibold">By project type</h2>
              <p className="mb-4 text-xs text-admin-muted">What clients want to build (excludes cancelled).</p>
              {byType.length === 0 ? (
                <p className="py-6 text-center text-xs text-admin-muted">No active bookings yet.</p>
              ) : (
                <ul className="space-y-3">
                  {byType.map(([label, v]) => (
                    <BarRow key={label} label={label} value={v} max={byType[0][1]} />
                  ))}
                </ul>
              )}
            </Panel>
            <Panel className="p-5">
              <h2 className="text-sm font-semibold">Busiest days</h2>
              <p className="mb-4 text-xs text-admin-muted">Meetings per weekday in your timezone (excludes cancelled).</p>
              <ul className="space-y-3">
                {byWeekday.map((d) => (
                  <BarRow key={d.label} label={d.label} value={d.value} max={Math.max(...byWeekday.map((x) => x.value))} />
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
