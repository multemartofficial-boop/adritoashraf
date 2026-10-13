// Client-safe date/time formatting for bookings (storage is UTC; display is per timezone).

export const fmtLongDate = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );

export const fmtShortDate = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));

export const fmtTime = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));

/** YYYY-MM-DD of an instant in a timezone (for grouping slots by day). */
export const dayKeyInTz = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

/** Short offset label such as "GMT+6". */
export const tzOffsetLabel = (tz: string, at = new Date()) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value ?? "";

const pad = (n: number) => String(n).padStart(2, "0");
/** 20260115T043000Z */
export const compactUtc = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

export function googleCalendarUrl(opts: { title: string; startIso: string; endIso: string; details?: string; location?: string }) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${compactUtc(opts.startIso)}/${compactUtc(opts.endIso)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";
  } catch {
    return "Asia/Dhaka";
  }
}

const FALLBACK_ZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "UTC",
];

export function allTimeZones(): string[] {
  try {
    const list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
    return list?.length ? list : FALLBACK_ZONES;
  } catch {
    return FALLBACK_ZONES;
  }
}
