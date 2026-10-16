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
import { TriHeading } from "@/components/site/section-heading";
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

      {/* Minimal navbar */}
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

      <main>
        <section className="section-x mx-auto grid w-full max-w-6xl items-center gap-10 py-8 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Left — pitch + form */}
          <div>
            {page.pill_text && (
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/45 bg-violet/12 px-3.5 py-1.5 text-xs font-medium tracking-[0.02em] text-[#C9B8FF] select-none">
                <span className="size-1.5 rounded-full bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF]" />
                {page.pill_text}
              </span>
            )}
            <TriHeading
              as="h1"
              tone="dark"
              text={page.heading}
              className="mt-5 text-[clamp(2rem,5vw,3.4rem)] leading-[1.08]"
            />
            {page.subheadline && (
              <p className="mt-4 max-w-xl text-sm text-white/60 md:text-base">
                {page.subheadline}
              </p>
            )}

            {page.bullets.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {page.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-white/75 md:text-[15px]"
                  >
                    <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-orange" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {page.audience_line && (
              <p className="mt-5 text-xs text-white/45 italic md:text-sm">
                {page.audience_line}
              </p>
            )}

            {/* Form card */}
            <div className="mt-7 max-w-lg rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 md:p-7">
              {page.cta_label && (
                <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <BadgeCheck className="size-5 text-violet" /> {page.cta_label}
                </p>
              )}
              {formId ? (
                <div data-reach-form={formId} />
              ) : (
                <p className="text-sm text-white/40">
                  Registration form coming soon.
                </p>
              )}
              {page.privacy_line && (
                <p className="mt-4 text-xs text-white/40">
                  {page.privacy_line}
                </p>
              )}
            </div>
          </div>

          {/* Right — gift cover */}
          <div className="relative order-first lg:order-none">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-violet/10 shadow-glow-violet lg:max-w-none">
              {page.cover_image ? (
                <FitImage
                  src={page.cover_image}
                  alt={page.internal_name}
                  priority
                  sizes="(max-width:1024px) 24rem, 45vw"
                />
              ) : (
                <div className="grid size-full place-items-center bg-holo">
                  <span className="px-8 text-center text-2xl font-bold text-white/60">
                    {page.internal_name}
                  </span>
                </div>
              )}
            </div>
            {page.cover_tag && (
              <span className="absolute top-4 right-4 rounded-full bg-orange-pill px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg">
                {page.cover_tag}
              </span>
            )}
          </div>
        </section>

        {/* Trust block */}
        <section className="section-x mx-auto w-full max-w-6xl pb-16">
          <div className="glass flex flex-col items-start gap-6 rounded-[2rem] p-6 sm:flex-row sm:items-center md:p-8">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-violet/15">
              {about.image_url && (
                <FitImage
                  src={about.image_url}
                  alt={settings.owner_name}
                  sizes="4rem"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{settings.owner_name}</p>
              <p className="mt-1 text-sm text-white/60">{bioLine}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/70 md:text-sm"
                >
                  <span className="font-semibold text-white">{s.value}</span>{" "}
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
