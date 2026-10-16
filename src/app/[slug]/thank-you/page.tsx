import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { getLandingPageBySlug, getSiteSettings } from "@/lib/data/public";
import { GIFT_LABELS } from "@/lib/landing-page-shared";
import { resolveGiftUrl } from "@/lib/landing-page";
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
    <div className="min-h-screen bg-ink text-white">
      <LpTracker slug={page.slug} kind="thankyou" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
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

      <main className="section-x mx-auto flex w-full max-w-2xl flex-col items-center pb-20 pt-10 text-center md:pt-16">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight">
          {page.thank_you_title || "You're all set!"}
        </h1>
        {page.thank_you_text && (
          <p className="mt-3 max-w-md text-sm text-white/60 md:text-base">
            {page.thank_you_text}
          </p>
        )}

        {giftUrl ? (
          <a
            href={giftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7C4DFF,#F78FD0)] px-7 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgb(124_77_255/0.55)]"
          >
            <GiftIcon className="size-4" />
            {GIFT_LABELS[page.gift_type]}
          </a>
        ) : (
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white/55">
            Your gift link isn&rsquo;t ready yet — check your email for it
            shortly.
          </p>
        )}

        {page.next_step_label && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Next step
            </p>
            <Link
              href={nextHref}
              className="group inline-flex items-center gap-1.5 rounded-full border border-violet/50 bg-violet/10 px-5 py-2.5 text-sm font-medium text-[#C9B8FF] transition-colors hover:border-violet hover:text-white"
            >
              {page.next_step_label}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
