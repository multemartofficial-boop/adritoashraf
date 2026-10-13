// Timezone helpers built on Intl (no extra dependency). All storage is UTC.

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Wall-clock parts of an instant in the given IANA timezone. */
export function zonedParts(date: Date, timeZone: string): Parts {
  const p = Object.fromEntries(formatter(timeZone).formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** Offset (minutes) of the timezone from UTC at the given instant. */
export function tzOffsetMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** Convert a wall-clock time in a timezone to a UTC Date (DST-safe). */
export function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = tzOffsetMinutes(new Date(guess), timeZone);
  let utc = guess - off1 * 60000;
  const off2 = tzOffsetMinutes(new Date(utc), timeZone);
  if (off2 !== off1) utc = guess - off2 * 60000;
  return new Date(utc);
}

/** [start, end) of the calendar month containing `date`, in the timezone, as UTC Dates. */
export function monthRangeUtc(date: Date, timeZone: string): [Date, Date] {
  const { year, month } = zonedParts(date, timeZone);
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  return [zonedToUtc(year, month, 1, 0, 0, timeZone), zonedToUtc(next.y, next.m, 1, 0, 0, timeZone)];
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
