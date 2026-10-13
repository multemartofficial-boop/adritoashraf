import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { zonedToUtc } from "@/lib/time";
import type { BookingSettingsRow } from "@/types/database";

export type AvailabilityData = {
  timezone: string;
  slotMinutes: number;
  /** UTC ISO start times, sorted ascending. */
  slots: string[];
};

type BusyRange = { id: string; start: number; end: number };

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

const parseTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
};

const localDayUtc = (d: Date, timeZone: string) => {
  // Calendar date components in the admin timezone.
  const p = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(d)
    .split("-")
    .map(Number);
  return { year: p[0], month: p[1], day: p[2] };
};

/**
 * Computes every bookable slot for the next `max_days_ahead` days, in UTC.
 * A slot is bookable when it sits inside an active availability window in the
 * admin timezone, starts after the minimum notice, is not on a blocked date,
 * the day is under the bookings cap, and it does not fall inside another
 * booking's buffer-extended range (same rule the database enforces).
 */
export async function getAvailability(opts?: { excludeBookingId?: string }): Promise<AvailabilityData> {
  const db = supabaseAdmin();
  const [settingsRes, rulesRes, blockedRes] = await Promise.all([
    db.from("booking_settings").select("*").eq("id", 1).single(),
    db.from("availability_rules").select("weekday, start_time, end_time").eq("is_active", true),
    db.from("blocked_dates").select("date"),
  ]);
  const settings = settingsRes.data as BookingSettingsRow | null;

  // Sensible defaults if settings were never seeded; still honours rules/blocks.
  const s: BookingSettingsRow = settings ?? {
    id: 1,
    slot_duration_minutes: 30,
    buffer_minutes: 15,
    max_bookings_per_day: 4,
    min_notice_hours: 12,
    max_days_ahead: 30,
    cancel_notice_hours: 12,
    timezone: "Asia/Dhaka",
    meeting_link_default: "",
    auto_confirm: false,
    updated_at: "",
  };
  const tz = s.timezone;
  const rules = rulesRes.data ?? [];
  const blocked = new Set((blockedRes.data ?? []).map((b) => b.date));
  if (rules.length === 0) return { timezone: tz, slotMinutes: s.slot_duration_minutes, slots: [] };

  const now = Date.now();
  const earliestStart = now + s.min_notice_hours * 3_600_000;
  const today = localDayUtc(new Date(now), tz);

  // Busy bookings that could overlap the window (incl. buffer margins on each side).
  const rangeStart = zonedToUtc(today.year, today.month, today.day, 0, 0, tz).getTime() - DAY_MS;
  const rangeEnd = rangeStart + (s.max_days_ahead + 2) * DAY_MS;
  let busyQuery = db
    .from("bookings")
    .select("id, start_time_utc, end_time_utc")
    .neq("status", "cancelled")
    .gte("end_time_utc", new Date(rangeStart).toISOString())
    .lte("start_time_utc", new Date(rangeEnd).toISOString());
  if (opts?.excludeBookingId) busyQuery = busyQuery.neq("id", opts.excludeBookingId);
  const { data: busyRows } = await busyQuery;

  const busy: BusyRange[] = (busyRows ?? []).map((b) => ({
    id: b.id,
    start: Date.parse(b.start_time_utc),
    end: Date.parse(b.end_time_utc),
  }));
  const buffer = s.buffer_minutes * MINUTE_MS;
  const dayKey = (y: number, m: number, d: number) =>
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Bookings per local day (for the daily cap).
  const perDay = new Map<string, number>();
  for (const b of busy) {
    const p = localDayUtc(new Date(b.start), tz);
    const key = dayKey(p.year, p.month, p.day);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const slots: number[] = [];
  const step = s.slot_duration_minutes * MINUTE_MS;

  for (let i = 0; i <= s.max_days_ahead; i++) {
    // `today` is already expressed in admin-tz components, so stepping the UTC
    // date walks consecutive admin-tz calendar days (DST-safe).
    const d = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const p = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    const key = dayKey(p.year, p.month, p.day);
    if (blocked.has(key)) continue;
    if ((perDay.get(key) ?? 0) >= s.max_bookings_per_day) continue;

    const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
    for (const rule of rules) {
      if (rule.weekday !== weekday) continue;
      const { h: sh, m: sm } = parseTime(rule.start_time);
      const { h: eh, m: em } = parseTime(rule.end_time);
      let start = zonedToUtc(p.year, p.month, p.day, sh, sm, tz).getTime();
      const windowEnd = zonedToUtc(p.year, p.month, p.day, eh, em, tz).getTime();

      for (; start + step <= windowEnd; start += step) {
        const end = start + step;
        if (start < earliestStart) continue;
        const clashes = busy.some((b) => b.start - buffer < end && b.end + buffer > start);
        if (!clashes) slots.push(start);
      }
    }
  }

  slots.sort((a, b) => a - b);
  return {
    timezone: tz,
    slotMinutes: s.slot_duration_minutes,
    slots: [...new Set(slots)].map((t) => new Date(t).toISOString()),
  };
}

/** True when `startUtc` is currently a bookable slot (used to re-validate on submit). */
export async function isSlotAvailable(startUtc: number, opts?: { excludeBookingId?: string }): Promise<number | null> {
  const data = await getAvailability(opts);
  const hit = data.slots.find((iso) => Date.parse(iso) === startUtc);
  return hit ? data.slotMinutes : null;
}
