// Client-safe webinar helpers (no server-only imports).
import type { WebinarRow } from "@/types/database";

/** Display timezone for webinar times (matches the audience's locale). */
export const WEBINAR_TZ = "Asia/Dhaka";

export type WebinarPhase = "tba" | "upcoming" | "live" | "ended";

export function webinarPhase(
  w: Pick<WebinarRow, "start_at" | "end_at">,
  now = new Date(),
): WebinarPhase {
  if (!w.start_at) return "tba";
  const start = new Date(w.start_at);
  const end = w.end_at ? new Date(w.end_at) : null;
  if (now < start) return "upcoming";
  if (!end || now <= end) return "live";
  return "ended";
}

export type WebinarBadge = {
  label: string;
  tone: "info" | "success" | "violet" | "neutral";
};

export function webinarBadge(
  w: Pick<WebinarRow, "start_at" | "end_at" | "recording_url">,
  now = new Date(),
): WebinarBadge {
  const phase = webinarPhase(w, now);
  if (phase === "tba") return { label: "To be announced", tone: "neutral" };
  if (phase === "upcoming") return { label: "Upcoming", tone: "info" };
  if (phase === "live") return { label: "Live now", tone: "success" };
  if (w.recording_url) return { label: "Recording available", tone: "violet" };
  return { label: "Ended", tone: "neutral" };
}

/** True when file_url is a private-bucket storage path rather than an external link. */
export const isStoragePath = (fileUrl: string) =>
  !/^https?:\/\//i.test(fileUrl);
