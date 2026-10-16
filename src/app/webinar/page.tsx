import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  MapPin,
  Radio,
} from "lucide-react";
import { getAboutMe, getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free Webinar — Custom Software for Small Business",
  description:
    "A free live session on when your business outgrows spreadsheets, what custom software really costs, and how the build process works — with live Q&A.",
  alternates: { canonical: "/webinar" },
};

// --- Edit these when the webinar is scheduled --------------------------------
const WEBINAR_WHEN = "Date & time to be announced";
const WEBINAR_WHERE = "Live on Google Meet";
const HOSTINGER_FORM_ID = "2f72dab9-3154-4b14-8755-ad0e0ec5ee69";
// ------------------------------------------------------------------------------

const LEARNINGS = [
  "The real signs your business has outgrown spreadsheets and WhatsApp threads",
  "What custom software costs, how long it takes, and what the process looks like",
  "Live Q&A — bring your project idea and get honest, no-pitch answers",
];

export default async function WebinarPage() {
  const [settings, about] = await Promise.all([
    getSiteSettings(),
    getAboutMe(),
  ]);
  const year = new Date().getFullYear();
  const firstName = (about.full_name || settings.owner_name).split(" ")[0];
  const host = new URL(publicEnv.NEXT_PUBLIC_SITE_URL).host;

  return (
    <div className="relative isolate min-h-svh overflow-clip bg-black text-white">
      {/* Ambient glow, same language as the portfolio headers. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[80vh] bg-[radial-gradient(70%_60%_at_50%_0%,rgb(242_107_58/0.5),transparent_70%)]"
      />

      {/* Minimal navbar: logo + back to site only. */}
      <header className="section-x flex items-center justify-between pt-5 md:pt-6">
        <Link
          href="/"
          className="grid size-11 place-items-center overflow-hidden rounded-full border border-violet/70 bg-ink/50 shadow-glow-violet backdrop-blur-md transition-transform duration-300 hover:scale-105"
          aria-label={`${settings.site_name} home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt={settings.site_name}
            className="size-full object-cover"
          />
        </Link>
        <Link
          href="/"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to site
        </Link>
      </header>

      <main className="section-x grid gap-12 pt-14 pb-16 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
        {/* Left: pitch */}
        <div>
          <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/85">
            <Radio className="size-4 text-orange" aria-hidden /> Free live
            webinar
          </p>
          <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,4.75rem)] leading-[0.98] font-extrabold tracking-tight">
            Custom Software for{" "}
            <span className="font-serif font-normal italic">
              Small Business
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            When spreadsheets stop working: a free session on what a custom
            website, SaaS or ERP would actually do for your business — no
            jargon, no sales pitch.
          </p>

          <ul className="mt-9 space-y-4">
            {LEARNINGS.map((item) => (
              <li key={item} className="flex gap-3.5">
                <span className="bg-orange-pill grid size-7 shrink-0 place-items-center rounded-full text-white">
                  <Check className="size-4" aria-hidden />
                </span>
                <span className="pt-0.5 leading-relaxed text-white/85">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm">
              <CalendarClock className="size-4 text-orange" aria-hidden />
              {WEBINAR_WHEN}
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm">
              <MapPin className="size-4 text-orange" aria-hidden />
              {WEBINAR_WHERE}
            </span>
          </div>

          {/* Host bio */}
          <figure className="mt-10 flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,#101024,#2b1a5c)] ring-2 ring-white/20">
              {about.image_url ? (
                <Image
                  src={about.image_url}
                  alt={about.full_name || settings.owner_name}
                  fill
                  sizes="56px"
                  className="object-cover object-top"
                />
              ) : (
                <span className="grid size-full place-items-center text-lg font-bold text-white/80">
                  {firstName.charAt(0)}
                </span>
              )}
            </span>
            <figcaption>
              <p className="font-semibold">
                {about.full_name || settings.owner_name}
                <span className="ml-2 align-middle text-xs font-medium text-white/50">
                  {about.role || settings.role}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {about.bio_1 || settings.tagline}
              </p>
              {about.experience_badge && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-lavender">
                  <BadgeCheck className="size-3.5" aria-hidden />{" "}
                  {about.experience_badge}
                  {about.location ? ` · ${about.location}` : ""}
                </p>
              )}
            </figcaption>
          </figure>
        </div>

        {/* Right: registration form */}
        <div className="lg:pt-4">
          <div className="scroll-reveal rounded-[2rem] bg-white p-6 text-ink shadow-[0_30px_80px_rgb(0_0_0/0.4)] md:p-9 lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Save your{" "}
              <span className="font-serif font-normal italic">free seat</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Register in 10 seconds — you&apos;ll get the Meet link and a
              reminder before we start.
            </p>
            <div className="mt-6" data-reach-form={HOSTINGER_FORM_ID} />
            <p className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
              <BadgeCheck className="size-4 text-violet" aria-hidden />
              Free to attend · No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </main>

      <footer className="section-x border-t border-white/10 py-6">
        <p className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <span>
            © {year} {settings.owner_name}. All rights reserved.
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white/70"
          >
            {host} <ArrowUpRight className="size-3.5" />
          </Link>
        </p>
      </footer>
    </div>
  );
}
