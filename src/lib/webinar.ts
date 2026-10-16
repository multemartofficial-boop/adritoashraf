import "server-only";
import { storage } from "@/lib/storage";
import type { WebinarRow } from "@/types/database";

export {
  WEBINAR_TZ,
  isStoragePath,
  webinarBadge,
  webinarPhase,
} from "./webinar-shared";

/** Resolve a resource to a downloadable URL — signed URL for private uploads, passthrough for links. */
export async function resolveResourceUrl(fileUrl: string): Promise<string> {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return storage().signedUrl(fileUrl, 3600);
}

const pad = (n: number) => String(n).padStart(2, "0");
const icsStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const icsEscape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** A downloadable .ics data URI for "Add to calendar". */
export function webinarIcsHref(w: WebinarRow, siteUrl: string): string | null {
  if (!w.start_at) return null;
  const end =
    w.end_at ??
    new Date(new Date(w.start_at).getTime() + 60 * 60 * 1000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//adritoashraf//webinars//EN",
    "BEGIN:VEVENT",
    `UID:webinar-${w.id}@adritoashraf.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(new Date(w.start_at))}`,
    `DTEND:${icsStamp(new Date(end))}`,
    `SUMMARY:${icsEscape(w.title)}`,
    `DESCRIPTION:${icsEscape(`Webinar — ${siteUrl}/dashboard/webinars/${w.id}`)}`,
    `URL:${siteUrl}/dashboard/webinars/${w.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
