import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleUserRound,
} from "lucide-react";
import {
  getAboutMe,
  getLandingPageBySlug,
  getPublishedLandingPageSlugs,
  getSiteSettings,
} from "@/lib/data/public";
import { FitImage } from "@/components/ui/fit-image";
import { LpTracker } from "@/components/site/lp-tracker";
import { LeadForm } from "@/components/site/lead-form";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedLandingPageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  if (!page) return {};
  const title = page.seo_title || page.internal_name;
  const description = page.seo_description || page.subheadline || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${page.slug}`,
      images: page.og_image
        ? [{ url: page.og_image, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: page.og_image ? [page.og_image] : undefined,
    },
  };
}

const WRAPPER = "w-full mx-auto max-w-7xl px-5 sm:px-8 lg:px-12";

export default async function LandingPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  if (!page) notFound();

  const [settings, about] = await Promise.all([
    getSiteSettings(),
    getAboutMe(),
  ]);
  const stats = settings.about_stats.slice(0, 2);
  const accent = page.heading?.accent ?? "";
  const accentTail = accent.split(" ").pop() ?? "";
  const accentHead = accent.slice(
    0,
    Math.max(0, accent.length - accentTail.length),
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-white">
      <LpTracker slug={page.slug} kind="view" />

      {/* Minimal navbar — same wrapper as the content */}
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

      <main className={`${WRAPPER} relative pb-14`}>
        {/* Soft glow behind the hero so the page doesn't feel empty */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-[480px] w-[900px] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(124_77_255/0.22),rgb(247_143_208/0.07),transparent)] blur-3xl"
        />

        {/*
          DOM order = mobile flow: intro -> form block -> bullets/trust.
          On lg the grid pins the form block into the right column, vertically centered.
        */}
        <div className="relative grid gap-10 py-8 md:py-10 lg:grid-cols-2 lg:items-center lg:gap-x-16 lg:py-16 xl:gap-20">
          {/* Intro — badge, headline, subheadline */}
          <div className="lg:col-start-1 lg:row-start-1">
            {page.pill_text && (
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/45 bg-violet/12 px-3.5 py-1.5 text-xs font-medium tracking-[0.02em] text-[#C9B8FF] select-none">
                <span className="size-1.5 rounded-full bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF]" />
                {page.pill_text}
              </span>
            )}
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {accentHead && <span className="text-white">{accentHead}</span>}
              {accentTail && <span className="text-orange">{accentTail}</span>}
            </h1>
            {(page.heading?.strong || page.heading?.muted) && (
              <p className="mt-3 max-w-xl text-xl leading-snug font-medium md:text-2xl">
                {page.heading?.strong && (
                  <span className="text-white">{page.heading.strong} </span>
                )}
                {page.heading?.muted && (
                  <span className="text-zinc-400">{page.heading.muted}</span>
                )}
              </p>
            )}
            {page.subheadline && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
                {page.subheadline}
              </p>
            )}
          </div>

          {/* Right column — form card with the gift cover overlapping the corner */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              {/* Mini book mockup overlapping the card corner */}
              <div className="absolute -top-8 -right-3 z-10 w-28 rotate-6 sm:w-32 md:-right-6">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-xl border border-white/15 shadow-[0_16px_40px_rgb(124_77_255/0.35)] ${
                    page.cover_image
                      ? ""
                      : "bg-[linear-gradient(145deg,#1c1040_0%,#4c2ea8_45%,#7C4DFF_75%,#F78FD0_115%)]"
                  }`}
                >
                  {page.cover_image ? (
                    <FitImage
                      src={page.cover_image}
                      alt={page.internal_name}
                      priority
                      sizes="9rem"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(110deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_14px)]" />
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#140b33]/95 via-[#140b33]/40 to-transparent" />
                      <p className="absolute inset-x-0 bottom-0 line-clamp-3 p-3 text-[13px] leading-snug font-bold text-white">
                        {page.internal_name}
                      </p>
                    </>
                  )}
                </div>
                {page.cover_tag && (
                  <span className="bg-orange-pill absolute -top-2 -right-2 rounded-full px-2.5 py-1 text-[10px] font-bold text-ink shadow-lg">
                    {page.cover_tag}
                  </span>
                )}
              </div>

              {/* Form card */}
              <div className="relative rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgb(124_77_255/0.10),rgb(255_255_255/0.03)_55%)] p-6 pt-10 shadow-[0_24px_70px_rgb(124_77_255/0.18)] md:p-8">
                {page.cta_label && (
                  <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <BadgeCheck className="size-5 shrink-0 text-violet" />{" "}
                    {page.cta_label}
                  </p>
                )}
                <LeadForm
                  slug={page.slug}
                  buttonLabel={page.cta_label || "Send me the free gift"}
                />
                {page.privacy_line && (
                  <p className="mt-4 text-sm text-zinc-400">
                    {page.privacy_line}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bullets + audience + trust strip — bottom-left on desktop */}
          <div className="lg:col-start-1 lg:row-start-2">
            {page.bullets.length > 0 && (
              <ul className="max-w-xl space-y-3">
                {page.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-base text-zinc-300"
                  >
                    <CheckCircle2 className="mt-1 size-4.5 shrink-0 text-orange" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {page.audience_line && (
              <p className="mt-6 max-w-xl border-l-2 border-violet/50 pl-4 text-sm leading-relaxed text-zinc-400">
                {page.audience_line}
              </p>
            )}

            {/* Compact trust strip */}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-violet/15 ring-1 ring-violet/40">
                  {about.image_url ? (
                    <FitImage
                      src={about.image_url}
                      alt={settings.owner_name}
                      sizes="3rem"
                    />
                  ) : (
                    <CircleUserRound className="size-full p-2 text-violet" />
                  )}
                </div>
                <p className="min-w-0 text-sm leading-snug">
                  <span className="block font-semibold">
                    {settings.owner_name}
                  </span>
                  <span className="block text-zinc-400">
                    {about.role || settings.role}
                  </span>
                </p>
              </div>
              {stats.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs text-zinc-300 md:text-sm"
                >
                  <span className="font-bold text-white">{s.value}</span>{" "}
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Subtle "how it works" strip */}
        <div className="relative mx-auto max-w-3xl">
          <ol className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-zinc-500 md:text-sm">
            {[
              "Enter your email",
              "Get the checklist instantly",
              "Book a free call if you want help",
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-violet/25 text-[10px] font-bold text-lavender">
                  {i + 1}
                </span>
                {step}
                {i < 2 && <span className="text-zinc-600">·</span>}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
