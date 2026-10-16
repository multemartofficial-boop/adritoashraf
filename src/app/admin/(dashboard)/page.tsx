import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ExternalLink,
  FolderKanban,
  HardDrive,
  HeartPulse,
  Hourglass,
  Plus,
  Presentation,
  Upload,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { monthRangeUtc, zonedToUtc, zonedParts } from "@/lib/time";
import { dayKeyInTz, fmtShortDate, fmtTime } from "@/lib/booking/format";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { StatsRow, type Stat } from "@/components/admin/stats-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingsChart, type DayPoint } from "./bookings-chart";
import { QuickSetup } from "./quick-setup";

export const metadata: Metadata = { title: "Overview" };

const STORAGE_LIMIT_BYTES = 1024 ** 3; // Supabase free plan

/** Reads the cron heartbeat row written by /api/cron/reminders. */
function parseCronRun(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const v = value as { at?: unknown; sent?: unknown; failed?: unknown };
  if (typeof v.at !== "string") return null;
  return {
    at: v.at,
    sent: typeof v.sent === "number" ? v.sent : 0,
    failed: typeof v.failed === "number" ? v.failed : 0,
    stale: Date.now() - new Date(v.at).getTime() > 40 * 3_600_000,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export default async function OverviewPage() {
  const { supabase, name } = await requireAdmin();

  const { data: bookingSettings } = await supabase
    .from("booking_settings")
    .select("timezone")
    .eq("id", 1)
    .maybeSingle();
  const tz = bookingSettings?.timezone ?? "Asia/Dhaka";
  const [monthStart, monthEnd] = monthRangeUtc(new Date(), tz);

  const chartStart = new Date();
  chartStart.setUTCDate(chartStart.getUTCDate() - 29);

  const [
    projects,
    published,
    monthBookings,
    pending,
    quickSetup,
    storageBytes,
    recent,
    upcoming,
    cron,
    memberCount,
    webinarCount,
    grantCount,
    upcomingWebinars,
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("start_time_utc", monthStart.toISOString())
      .lt("start_time_utc", monthEnd.toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("dashboard_state")
      .select("value")
      .eq("key", "quick_setup")
      .maybeSingle(),
    Promise.all([
      storage().usageBytes("public"),
      storage().usageBytes("private"),
    ])
      .then(([a, b]) => a + b)
      .catch(() => null),
    supabase
      .from("bookings")
      .select("start_time_utc")
      .gte("start_time_utc", chartStart.toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("bookings")
      .select(
        "id, reference_code, client_name, service_id, start_time_utc, status",
      )
      .in("status", ["pending", "confirmed"])
      .gte("end_time_utc", new Date().toISOString())
      .order("start_time_utc")
      .limit(5),
    supabase
      .from("dashboard_state")
      .select("value")
      .eq("key", "cron_last_run")
      .maybeSingle(),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("webinars").select("id", { count: "exact", head: true }),
    supabase
      .from("webinar_access")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("webinars")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("start_at", new Date().toISOString()),
  ]);

  const serviceIds = [
    ...new Set(
      (upcoming.data ?? [])
        .map((b) => b.service_id)
        .filter((v): v is string => !!v),
    ),
  ];
  const { data: serviceRows } = serviceIds.length
    ? await supabase.from("services").select("id, title").in("id", serviceIds)
    : { data: [] };
  const serviceTitle = new Map((serviceRows ?? []).map((s) => [s.id, s.title]));

  // Bucket the last 30 days of bookings per admin-tz day.
  const today = zonedParts(new Date(), tz);
  const chartData: DayPoint[] = [];
  const counts = new Map<string, number>();
  for (const b of recent.data ?? []) {
    const k = dayKeyInTz(b.start_time_utc, tz);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  for (let i = 29; i >= 0; i--) {
    const d = zonedToUtc(today.year, today.month, today.day - i, 0, 0, tz);
    const key = dayKeyInTz(d.toISOString(), tz);
    chartData.push({
      day: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: tz,
      }).format(d),
      bookings: counts.get(key) ?? 0,
    });
  }

  const cronRun = parseCronRun(cron.data?.value);

  const dismissed =
    typeof quickSetup.data?.value === "object" &&
    quickSetup.data?.value !== null &&
    !Array.isArray(quickSetup.data.value) &&
    quickSetup.data.value.dismissed === true;

  const stats: Stat[] = [
    {
      label: "Total Projects",
      hint: "Published projects out of all projects in the portfolio.",
      value: `${published.count ?? 0} / ${projects.count ?? 0}`,
      unit: "published",
      icon: FolderKanban,
      tone: "info",
    },
    {
      label: "Bookings This Month",
      hint: "Meetings scheduled this calendar month (excluding cancelled).",
      value: String(monthBookings.count ?? 0),
      unit: "meetings",
      icon: CalendarCheck,
      tone: "success",
    },
    {
      label: "Pending Requests",
      hint: "Bookings waiting for you to confirm.",
      value: String(pending.count ?? 0),
      unit: "to review",
      icon: Hourglass,
      tone: "danger",
    },
    {
      label: "Members",
      hint: "Registered accounts in the members area.",
      value: String(memberCount.count ?? 0),
      unit: "signed up",
      icon: Users,
      tone: "info",
    },
    {
      label: "Webinars",
      hint: "Total webinars in the members area.",
      value: String(webinarCount.count ?? 0),
      unit: `${upcomingWebinars.count ?? 0} upcoming`,
      icon: Presentation,
      tone: "success",
    },
    {
      label: "Access Grants",
      hint: "Emails granted access to webinars.",
      value: String(grantCount.count ?? 0),
      unit: "members",
      icon: Users,
      tone: "warning",
    },
    {
      label: "Storage Used",
      hint: "Uploaded images and client attachments in Supabase Storage.",
      value: storageBytes === null ? "—" : formatBytes(storageBytes),
      unit: `/ ${formatBytes(STORAGE_LIMIT_BYTES)}`,
      icon: HardDrive,
      tone: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]}`}
        description="Manage your portfolio content, services and client meetings from one place."
        actions={
          <>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus /> New Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/media">
                <Upload /> Upload Media
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View Site
              </a>
            </Button>
          </>
        }
      />

      <QuickSetup dismissed={dismissed} />

      <StatsRow
        stats={stats}
        footnote={`Months are counted in ${tz} time. Storage limit reflects the Supabase free plan.`}
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Booking activity</h2>
              <p className="text-xs text-admin-muted">
                Meetings per day, last 30 days ({tz}).
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">
                All bookings <ArrowRight />
              </Link>
            </Button>
          </div>
          <BookingsChart data={chartData} />
        </Panel>

        <Panel className="flex flex-col p-5">
          <h2 className="text-sm font-semibold">Upcoming bookings</h2>
          <p className="mb-3 text-xs text-admin-muted">
            Your next confirmed and pending meetings.
          </p>
          {upcoming.data?.length ? (
            <ul className="divide-y divide-admin-border">
              {upcoming.data.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {b.client_name}
                    </p>
                    <p className="truncate text-xs text-admin-muted">
                      {b.service_id
                        ? (serviceTitle.get(b.service_id) ?? "—")
                        : "General enquiry"}{" "}
                      · {b.reference_code}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium whitespace-nowrap">
                      {fmtShortDate(b.start_time_utc, tz)} ·{" "}
                      {fmtTime(b.start_time_utc, tz)}
                    </p>
                    <Badge
                      tone={b.status === "confirmed" ? "success" : "warning"}
                      dot
                      className="mt-0.5 capitalize"
                    >
                      {b.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-admin-muted">
              Nothing booked yet.
            </p>
          )}
          <div className="mt-auto pt-3">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/bookings?status=confirmed">
                View all meetings
              </Link>
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-wrap items-center gap-3 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-admin-success ring-1 ring-emerald-100">
          <HeartPulse className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Reminder cron</p>
          <p className="text-xs text-admin-muted">
            {cronRun
              ? `Last ran ${fmtShortDate(cronRun.at, tz)} · ${fmtTime(cronRun.at, tz)} — ${cronRun.sent ?? 0} reminder${cronRun.sent === 1 ? "" : "s"} sent${
                  cronRun.failed ? `, ${cronRun.failed} failed` : ""
                }.`
              : "Has not run yet. Add the daily cron job on the server (see README §5)."}
          </p>
        </div>
        {cronRun &&
          (cronRun.stale ? (
            <Badge tone="warning" dot>
              Stale — cron may not be running
            </Badge>
          ) : (
            <Badge tone="success" dot>
              Healthy
            </Badge>
          ))}
      </Panel>
    </div>
  );
}
