import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  PlayCircle,
} from "lucide-react";
import { getLandingPageBySlug, getSiteSettings } from "@/lib/data/public";
import { GIFT_LABELS } from "@/lib/landing-page-shared";
import { resolveGiftUrl } from "@/lib/landing-page";
import { FitImage } from "@/components/ui/fit-image";
import { LpTracker } from "@/components/site/lp-tracker";

// Signed gift URLs are minted per render — never prerender this page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're all set!",
  robots: { index: false, follow: false },
};

const GIFT_ICONS = {
  pdf: Download,
  video: PlayCircle,
  link: ExternalLink,
} as const;

const WRAPPER = "w-full mx-auto max-w-7xl px-5 sm:px-8 lg:px-12";

export default async function ThankYouPage({
  params,
}: PageProps<"/[slug]/thank-you">) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  if (!page) notFound();

  const settings = await getSiteSettings();
  const giftUrl = await resolveGiftUrl(page);
  const GiftIcon = GIFT_ICONS[page.gift_type];
  const nextHref = page.next_step_href || "/book";

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-white">
      <LpTracker slug={page.slug} kind="thankyou" />

      <header className={`${WRAPPER} flex items-center justify-between py-4`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold"
          aria-label="Back to homepage"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt={settings.site_name}
            className="size-9 rounded-full"
          />
          <span className="hidden sm:inline">{settings.site_name}</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to site
        </Link>
      </header>

      <main
        className={`${WRAPPER} relative flex min-h-[70svh] items-center pb-16`}
      >
        {/* Soft glow behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 -z-0 h-[420px] w-[800px] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(124_77_255/0.20),rgb(247_143_208/0.06),transparent)] blur-3xl"
        />

        <div className="relative grid w-full items-center gap-10 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgb(124_77_255/0.08),rgb(255_255_255/0.02)_60%)] p-7 shadow-[0_24px_70px_rgb(0_0_0/0.35)] md:p-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: confirmation + actions */}
          <div>
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-5 max-w-xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl">
              {page.thank_you_title || "You're all set!"}
            </h1>
            {page.thank_you_text && (
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
                {page.thank_you_text}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {giftUrl ? (
                <a
                  href={giftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7C4DFF,#F78FD0)] px-7 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgb(124_77_255/0.55)]"
                  data-track="checklist_download"
                >
                  <GiftIcon className="size-4" />
                  {GIFT_LABELS[page.gift_type]}
                </a>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-zinc-400">
                  <Mail className="size-4 shrink-0" /> Check your inbox — the
                  link is on its way.
                </p>
              )}

              {page.next_step_label && (
                <Link
                  href={nextHref}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-violet/50 bg-violet/10 px-6 py-3 text-sm font-medium text-[#C9B8FF] transition-colors hover:border-violet hover:text-white"
                >
                  {page.next_step_label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            {giftUrl && (
              <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                <Mail className="size-3.5" /> A copy was also sent to your
                email.
              </p>
            )}
          </div>

          {/* Right: gift mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-44 rotate-[-3deg] sm:w-52">
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_60px_rgb(124_77_255/0.35)] ${
                  page.cover_image
                    ? ""
                    : "bg-[linear-gradient(145deg,#1c1040_0%,#4c2ea8_45%,#7C4DFF_75%,#F78FD0_115%)]"
                }`}
              >
                {page.cover_image ? (
                  <FitImage
                    src={page.cover_image}
                    alt={page.internal_name}
                    sizes="13rem"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(110deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_14px)]" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#140b33]/95 via-[#140b33]/40 to-transparent" />
                    <p className="absolute inset-x-0 bottom-0 line-clamp-3 p-4 text-sm leading-snug font-bold text-white">
                      {page.internal_name}
                    </p>
                  </>
                )}
              </div>
              <span className="bg-orange-pill absolute -top-3 -right-3 rounded-full px-3 py-1.5 text-xs font-bold text-ink shadow-lg">
                {page.cover_tag || "100% Free"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
