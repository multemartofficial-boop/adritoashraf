import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Download,
  FileText,
  Lock,
  Radio,
  Video,
} from "lucide-react";
import { requireMember } from "@/lib/auth/session";
import {
  isStoragePath,
  resolveResourceUrl,
  webinarBadge,
  webinarIcsHref,
  webinarPhase,
  WEBINAR_TZ,
} from "@/lib/webinar";
import {
  fmtLongDate,
  fmtTime,
  googleCalendarUrl,
  tzOffsetLabel,
} from "@/lib/booking/format";
import { parseVideoUrl } from "@/lib/video";
import { publicEnv } from "@/lib/env/public";
import { FitImage } from "@/components/ui/fit-image";

export const metadata: Metadata = {
  title: "Webinar",
  robots: { index: false, follow: false },
};

const BADGE_STYLES = {
  info: "bg-blue-400/15 text-blue-200 ring-blue-300/30",
  success: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  violet: "bg-violet/25 text-lavender ring-violet/40",
  neutral: "bg-white/10 text-white/60 ring-white/15",
} as const;

export default async function MemberWebinarPage({
  params,
}: PageProps<"/dashboard/webinars/[id]">) {
  const { id } = await params;
  const { supabase } = await requireMember();

  // RLS: only published webinars the member has been granted are visible.
  const { data: webinar } = await supabase
    .from("webinars")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!webinar) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-4">
        <div className="glass flex max-w-md flex-col items-center gap-3 rounded-[2rem] px-8 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-violet/15 text-lavender">
            <Lock className="size-5" />
          </span>
          <h1 className="text-xl font-semibold">
            You don&rsquo;t have access yet
          </h1>
          <p className="text-sm text-white/55">
            This webinar isn&rsquo;t linked to your account. If you registered
            with a different email, sign in with that one — or contact us and
            we&rsquo;ll sort it out.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
          >
            <ArrowLeft className="size-4" /> My webinars
          </Link>
        </div>
      </div>
    );
  }

  const { data: resources } = await supabase
    .from("webinar_resources")
    .select("*")
    .eq("webinar_id", webinar.id)
    .order("sort_order");

  const resolved = await Promise.all(
    (resources ?? []).map(async (r) => ({
      ...r,
      url: await resolveResourceUrl(r.file_url).catch(() => ""),
    })),
  );

  const phase = webinarPhase(webinar);
  const badge = webinarBadge(webinar);
  const recording = webinar.recording_url
    ? parseVideoUrl(webinar.recording_url)
    : null;
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
  const icsHref = webinarIcsHref(webinar, siteUrl);
  const gcalHref = webinar.start_at
    ? googleCalendarUrl({
        title: webinar.title,
        startIso: webinar.start_at,
        endIso:
          webinar.end_at ??
          new Date(
            new Date(webinar.start_at).getTime() + 3600_000,
          ).toISOString(),
        details: `Webinar — ${siteUrl}/dashboard/webinars/${webinar.id}`,
      })
    : null;
  const canJoin =
    webinar.live_url && (phase === "upcoming" || phase === "live");

  return (
    <div className="mx-auto max-w-4xl pt-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" /> My webinars
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${BADGE_STYLES[badge.tone]}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {badge.label}
        </span>
        {webinar.start_at && (
          <p className="flex items-center gap-1.5 text-sm text-white/60">
            <CalendarDays className="size-4" />
            {fmtLongDate(webinar.start_at, WEBINAR_TZ)} ·{" "}
            {fmtTime(webinar.start_at, WEBINAR_TZ)}
            {webinar.end_at ? `–${fmtTime(webinar.end_at, WEBINAR_TZ)}` : ""} (
            {tzOffsetLabel(WEBINAR_TZ, new Date(webinar.start_at))})
          </p>
        )}
      </div>

      <h1 className="mt-4 text-[clamp(2rem,6vw,3.2rem)] leading-[1.05] font-bold tracking-tight">
        {webinar.title}
      </h1>
      {webinar.description && (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/65 md:text-base">
          {webinar.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canJoin && (
          <a
            href={webinar.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
          >
            <Radio className="size-4" />{" "}
            {phase === "live" ? "Join now" : "Join live session"}
          </a>
        )}
        {gcalHref && phase !== "ended" && (
          <a
            href={gcalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            <CalendarPlus className="size-4" /> Google Calendar
          </a>
        )}
        {icsHref && phase !== "ended" && (
          <a
            href={icsHref}
            download={`${webinar.slug || "webinar"}.ics`}
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            <Download className="size-4" /> Add to calendar (.ics)
          </a>
        )}
      </div>

      {/* Recording */}
      {phase === "ended" && recording && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Video className="size-5 text-lavender" /> Recording
          </h2>
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
            {recording.kind === "file" ? (
              <video
                src={recording.src}
                controls
                preload="metadata"
                className="aspect-video w-full"
              />
            ) : (
              <iframe
                src={recording.embed}
                title={`${webinar.title} recording`}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </section>
      )}

      {/* Thumbnail when nothing else to show yet */}
      {phase !== "ended" && webinar.thumbnail_url && (
        <div className="relative mt-10 aspect-video overflow-hidden rounded-[1.75rem] border border-white/10 bg-violet/10">
          <FitImage
            src={webinar.thumbnail_url}
            alt={webinar.title}
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {/* Resources */}
      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5 text-lavender" /> Resources
          </h2>
          <ul className="space-y-2">
            {resolved.map((r) => (
              <li key={r.id}>
                {r.url ? (
                  <a
                    href={r.url}
                    target={isStoragePath(r.file_url) ? undefined : "_blank"}
                    rel={
                      isStoragePath(r.file_url)
                        ? undefined
                        : "noopener noreferrer"
                    }
                    download={isStoragePath(r.file_url) || undefined}
                    className="glass flex items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-lavender" />
                      <span className="truncate">{r.title}</span>
                    </span>
                    <Download className="size-4 shrink-0 text-white/50" />
                  </a>
                ) : (
                  <span className="glass flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm text-white/40">
                    <FileText className="size-4 shrink-0" /> {r.title}{" "}
                    (unavailable)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
