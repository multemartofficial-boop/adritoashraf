import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CheckCircle2 } from "lucide-react";
import {
  getAboutMe,
  getLandingPageBySlug,
  getPublishedLandingPageSlugs,
  getSiteSettings,
} from "@/lib/data/public";
import { reachFormId } from "@/lib/landing-page-shared";
import { cn } from "@/lib/utils";
import { FitImage } from "@/components/ui/fit-image";
import { LpTracker } from "@/components/site/lp-tracker";

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

export default async function LandingPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  if (!page) notFound();

  const [settings, about] = await Promise.all([
    getSiteSettings(),
    getAboutMe(),
  ]);
  const formId = reachFormId(page.form_embed);
  const stats = settings.about_stats.slice(0, 2);
  const bioLine =
    about.bio_1.split(". ")[0]?.trim() || about.role || settings.role;

  return (
    <div className="min-h-screen bg-ink text-white">
      <LpTracker slug={page.slug} kind="view" />

      {/* Minimal navbar — same container as the content */}
      <header className="section-x mx-auto flex w-full max-w-6xl items-center justify-between py-4">
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

      <main className="section-x mx-auto w-full max-w-6xl pb-14 pt-4 md:pt-8">
        {/*
          DOM order matches mobile flow: intro -> cover -> bullets -> form -> host.
          On lg the grid pins cover+form into the right column.
        */}
        <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-x-14">
          {/* Intro — badge, headline, subheadline */}
          <div className="lg:col-start-1 lg:row-start-1">
            {page.pill_text && (
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/45 bg-violet/12 px-3.5 py-1.5 text-xs font-medium tracking-[0.02em] text-[#C9B8FF] select-none">
                <span className="size-1.5 rounded-full bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF]" />
                {page.pill_text}
              </span>
            )}
            <h1 className="mt-4 max-w-xl text-3xl leading-[1.12] font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl">
              {page.heading?.accent && (
                <span className="text-orange">{page.heading.accent} </span>
              )}
              {page.heading?.strong && (
                <span className="text-white">{page.heading.strong} </span>
              )}
              {page.heading?.muted && (
                <span className="text-zinc-400">{page.heading.muted}</span>
              )}
            </h1>
            {page.subheadline && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 lg:text-lg">
                {page.subheadline}
              </p>
            )}
          </div>

          {/* Gift cover — mobile: compact + centered, lg: top of right column */}
          <div className="flex justify-center lg:col-start-2 lg:row-start-1">
            <div className="relative w-full max-w-[260px] lg:max-w-[340px]">
              <div
                className={cn(
                  "relative h-[220px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgb(124_77_255/0.25)] lg:h-auto lg:aspect-[3/4] lg:rotate-[-2deg]",
                  !page.cover_image &&
                    "bg-[linear-gradient(145deg,#1c1040_0%,#4c2ea8_45%,#7C4DFF_75%,#F78FD0_115%)]",
                )}
              >
                {page.cover_image ? (
                  <FitImage
                    src={page.cover_image}
                    alt={page.internal_name}
                    priority
                    sizes="(max-width:1024px) 260px, 340px"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(110deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_16px)]" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#140b33]/95 via-[#140b33]/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[10px] font-bold tracking-[0.18em] text-violet-200/80 uppercase">
                        {page.pill_text || "Free download"}
                      </p>
                      <p className="mt-1.5 text-lg leading-snug font-bold text-white md:text-xl">
                        {page.internal_name}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {page.cover_tag && (
                <span className="bg-orange-pill absolute -top-2.5 -right-2.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg lg:top-4 lg:-right-3.5">
                  {page.cover_tag}
                </span>
              )}
            </div>
          </div>

          {/* Bullets + who-it's-for — left column */}
          <div className="lg:col-start-1 lg:row-start-2">
            {page.bullets.length > 0 && (
              <ul className="max-w-md space-y-3">
                {page.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-zinc-300 md:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-orange" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {page.audience_line && (
              <p className="mt-5 max-w-md text-xs text-zinc-500 italic md:text-sm">
                {page.audience_line}
              </p>
            )}
          </div>

          {/* Form card — right column under the cover */}
          <div className="lg:col-start-2 lg:row-start-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 lg:sticky lg:top-6">
              {page.cta_label && (
                <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <BadgeCheck className="size-5 text-violet" /> {page.cta_label}
                </p>
              )}
              {formId ? (
                <div
                  className="overflow-hidden [&_iframe]:w-full"
                  data-reach-form={formId}
                />
              ) : (
                <p className="text-sm text-white/40">
                  Registration form coming soon.
                </p>
              )}
              {page.privacy_line && (
                <p className="mt-4 text-sm text-zinc-400">
                  {page.privacy_line}
                </p>
              )}
            </div>
          </div>

          {/* Host / trust card — full width of the grid */}
          <div className="lg:col-span-2 lg:row-start-3">
            <div className="glass rounded-2xl p-5 md:p-7">
              <div className="flex items-start gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-violet/15 md:size-[4.5rem]">
                  {about.image_url && (
                    <FitImage
                      src={about.image_url}
                      alt={settings.owner_name}
                      sizes="4.5rem"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{settings.owner_name}</p>
                  <p className="text-xs text-violet-200/80 md:text-sm">
                    {about.role || settings.role}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {bioLine}
                  </p>
                </div>
              </div>
              {stats.length > 0 && (
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  {stats.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-zinc-300 md:text-sm"
                    >
                      <span className="font-bold text-white">{s.value}</span>
                      <span>{s.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
