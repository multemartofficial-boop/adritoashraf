import type { BookingRow } from "@/types/database";
import { compactUtc as icsDate } from "./format";

const escIcs = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold a content line at 75 octets on UTF-8 char boundaries (RFC 5545). */
const fold = (line: string) => {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch, "utf8");
    if (bytes + n > 74) {
      out.push(cur);
      cur = " " + ch;
      bytes = 1 + n;
    } else {
      cur += ch;
      bytes += n;
    }
  }
  out.push(cur);
  return out.join("\r\n");
};

export function icsForBooking(booking: Pick<BookingRow, "reference_code" | "start_time_utc" | "end_time_utc" | "status">, opts: {
  summary: string;
  description: string;
  location: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Adrito Ashraf//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference_code}@adrito-booking`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(booking.start_time_utc)}`,
    `DTEND:${icsDate(booking.end_time_utc)}`,
    `SUMMARY:${escIcs(opts.summary)}`,
    `DESCRIPTION:${escIcs(opts.description)}`,
    `LOCATION:${escIcs(opts.location)}`,
    `STATUS:${booking.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export { googleCalendarUrl } from "./format";
