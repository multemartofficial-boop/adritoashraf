import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Video } from "lucide-react";
import { requireMember } from "@/lib/auth/session";
import { webinarBadge, WEBINAR_TZ } from "@/lib/webinar";
import { fmtLongDate, fmtTime } from "@/lib/booking/format";
import { FitImage } from "@/components/ui/fit-image";

export const metadata: Metadata = {
  title: "My Webinars",
  robots: { index: false, follow: false },
};

const BADGE_STYLES = {
  info: "bg-blue-400/15 text-blue-200 ring-blue-300/30",
  success: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  violet: "bg-violet/25 text-lavender ring-violet/40",
  neutral: "bg-white/10 text-white/60 ring-white/15",
} as const;

export default async function DashboardPage() {
  const { supabase } = await requireMember();

  // RLS returns only published webinars this member has been granted.
  const { data: webinars } = await supabase
    .from("webinars")
    .select("*")
    .order("start_at", { ascending: false });
  const list = webinars ?? [];

  return (
    <div className="pt-4">
      <p className="tag-pill">Members area</p>
      <h1 className="mt-4 text-[clamp(2.2rem,6vw,3.5rem)] leading-[1.02] font-bold tracking-tight">
        My <span className="font-serif font-normal italic">webinars</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-white/60 md:text-base">
        Every session you&rsquo;ve been invited to lives here — join live or
        catch the replay.
      </p>

      {list.length === 0 ? (
        <div className="glass mt-10 flex flex-col items-center gap-3 rounded-[2rem] px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-violet/15 text-lavender">
            <Video className="size-5" />
          </span>
          <p className="font-medium">
            Your webinars will appear here once you&rsquo;re approved.
          </p>
          <p className="max-w-sm text-sm text-white/50">
            Registered for a webinar? Access usually lands within a day — check
            back soon.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((w) => {
            const badge = webinarBadge(w);
            return (
              <li key={w.id}>
                <Link
                  href={`/dashboard/webinars/${w.id}`}
                  className="group block overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-violet/50 hover:shadow-glow-violet"
                >
                  <div className="relative aspect-[16/10] bg-violet/10">
                    {w.thumbnail_url ? (
                      <FitImage
                        src={w.thumbnail_url}
                        alt={w.title}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-violet/40">
                        <Video className="size-10" />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur-md ${BADGE_STYLES[badge.tone]}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {badge.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg leading-snug font-semibold transition-colors group-hover:text-lavender">
                      {w.title}
                    </h2>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
                      <CalendarDays className="size-3.5" />
                      {w.start_at
                        ? `${fmtLongDate(w.start_at, WEBINAR_TZ)} · ${fmtTime(w.start_at, WEBINAR_TZ)}`
                        : "Date to be announced"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
