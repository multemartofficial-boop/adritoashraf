import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock,
  UserRound,
} from "lucide-react";
import {
  getProjectBySlug,
  getProjects,
  getSiteSettings,
} from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";
import { JsonLd } from "@/components/site/json-ld";
import { CARD_THEMES } from "@/components/site/card-themes";
import { FitImage } from "@/components/ui/fit-image";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { Gallery } from "./gallery";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const title =
    project.seo_title || `${project.title} ${project.title_accent}`.trim();
  const description = project.seo_description || project.short_description;
  const ogImage = project.og_image || project.cover_image;
  return {
    title,
    description,
    keywords: project.focus_keyword
      ? [project.focus_keyword, ...project.tags]
      : project.tags,
    alternates: {
      canonical: project.canonical_url || `/projects/${project.slug}`,
    },
    robots: project.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSiteSettings(),
  ]);
  if (!project) notFound();

  const theme = CARD_THEMES[project.card_theme];
  const index = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const meta = [
    project.role && { icon: UserRound, label: "My role", value: project.role },
    project.duration && {
      icon: Clock,
      label: "Duration",
      value: project.duration,
    },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  const projectUrl = `${base}/projects/${project.slug}`;

  return (
    <article className="bg-white text-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: base },
            {
              "@type": "ListItem",
              position: 2,
              name: "Portfolio",
              item: `${base}/projects`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: `${project.title} ${project.title_accent}`.trim(),
              item: projectUrl,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: `${project.title} ${project.title_accent}`.trim(),
          url: projectUrl,
          description:
            project.seo_description || project.short_description || undefined,
          image: project.og_image || project.cover_image || undefined,
          keywords: project.tags.length ? project.tags.join(", ") : undefined,
          creator: { "@type": "Person", name: settings.owner_name, url: base },
        }}
      />
      <header className="section-x relative isolate overflow-hidden bg-black pt-36 pb-16 text-white md:pt-44 md:pb-24">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_70%_at_50%_0%,rgb(242_107_58/0.45),transparent_70%)]"
        />
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> All projects
        </Link>
        <h1 className="mt-6 max-w-5xl text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] font-bold tracking-tight">
          {project.title}{" "}
          {project.title_accent && (
            <span className="font-serif font-normal italic">
              {project.title_accent}
            </span>
          )}
        </h1>
        {project.short_description && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            {project.short_description}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {meta.map((m) => (
            <span
              key={m.label}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            >
              <m.icon className="size-4 text-orange" aria-hidden />
              <span className="text-white/60">{m.label}:</span> {m.value}
            </span>
          ))}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Visit live site <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </header>

      <div className="section-x -mt-px bg-black pb-16">
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden rounded-[2rem]",
            theme.bg,
          )}
        >
          {project.cover_image ? (
            <FitImage
              src={project.cover_image}
              alt={project.cover_image_alt || `${project.title} cover`}
              priority
              sizes="100vw"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[clamp(2rem,6vw,5rem)] font-light tracking-[0.3em] uppercase opacity-70">
              {project.title}
            </span>
          )}
        </div>
      </div>

      <div className="section-x grid gap-14 py-20 md:py-28 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-14">
          {(project.problem || project.solution) && (
            <div className="grid gap-6 md:grid-cols-2">
              {project.problem && (
                <section className="rounded-[1.75rem] bg-[linear-gradient(160deg,#fff1ea,#ffffff)] p-7">
                  <span className="tag-pill">The problem</span>
                  <p className="mt-5 leading-relaxed whitespace-pre-line text-neutral-700">
                    {project.problem}
                  </p>
                </section>
              )}
              {project.solution && (
                <section className="rounded-[1.75rem] bg-[linear-gradient(160deg,#f2ecff,#ffffff)] p-7">
                  <span className="tag-pill">The solution</span>
                  <p className="mt-5 leading-relaxed whitespace-pre-line text-neutral-700">
                    {project.solution}
                  </p>
                </section>
              )}
            </div>
          )}

          {(site.caseStudyResults[project.slug]?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                The{" "}
                <span className="font-serif font-normal italic">results</span>
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {site.caseStudyResults[project.slug].map((r) => (
                  <li key={r.label} className="rounded-2xl bg-[linear-gradient(150deg,#efe8ff,#fff1ea)] p-5">
                    <p className="text-3xl font-bold tracking-tight text-orange">{r.value}</p>
                    <p className="mt-1 text-sm text-neutral-700">{r.label}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Key{" "}
                <span className="font-serif font-normal italic">features</span>
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm"
                  >
                    <span className="bg-orange-pill grid size-6 shrink-0 place-items-center rounded-full text-white">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.images.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Screen
                <span className="font-serif font-normal italic">shots</span>
              </h2>
              <Gallery
                images={project.images.map((i) => ({
                  id: i.id,
                  url: i.image_url,
                  caption: i.caption,
                }))}
                title={project.title}
              />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {project.tech_stack.length > 0 && (
            <div className="rounded-[1.75rem] bg-ink p-6 text-white">
              <h2 className="text-sm font-semibold text-white/60">
                Tech stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tech_stack.map((t) => (
                  <li
                    key={t}
                    className="glass rounded-full px-3 py-1.5 text-xs font-medium"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-holo rounded-[1.75rem] p-6">
            <CalendarClock className="size-6 text-violet" aria-hidden />
            <p className="mt-3 text-lg font-bold">Need something similar?</p>
            <p className="mt-1 text-sm text-neutral-700">
              Tell me about your project and book a short call with{" "}
              {settings.owner_name.split(" ")[0]}.
            </p>
            <Link
              href="/book"
              className="bg-cta mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            >
              Book a meeting <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>

      <div className="section-x pb-16">
        <div className="bg-holo flex flex-col items-center gap-5 rounded-[2rem] p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Need something <span className="font-serif font-normal italic">similar?</span>
          </h2>
          <Link
            href="/book"
            className="bg-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)] transition-transform duration-200 hover:scale-[1.03]"
          >
            Book a free call about a similar project <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      {next && next.id !== project.id && (
        <Link
          href={`/projects/${next.slug}`}
          className="section-x group flex items-center justify-between gap-6 border-t border-neutral-100 py-12 hover:bg-neutral-50"
        >
          <span>
            <span className="block text-sm text-neutral-500">Next project</span>
            <span className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold tracking-tight">
              {next.title}{" "}
              <span className="font-serif font-normal italic">
                {next.title_accent}
              </span>
            </span>
          </span>
          <ArrowRight
            className="size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </article>
  );
}
