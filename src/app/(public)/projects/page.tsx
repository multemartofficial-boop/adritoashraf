import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjects, getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";
import { JsonLd } from "@/components/site/json-ld";
import { CARD_THEMES } from "@/components/site/card-themes";
import { FitImage } from "@/components/ui/fit-image";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const text = s.section_texts.portfolio;
  return {
    title: text?.tag ? `All ${text.tag}` : "All projects",
    description:
      text?.description || `Selected work and case studies by ${s.owner_name}.`,
    alternates: { canonical: "/projects" },
    openGraph: {
      title: "All projects",
      description: text?.description || undefined,
    },
  };
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  const text = settings.section_texts.portfolio;

  return (
    <article className="bg-black text-white">
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
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${p.title} ${p.title_accent}`.trim(),
            url: `${base}/projects/${p.slug}`,
          })),
        }}
      />

      <header className="section-x relative isolate overflow-hidden pt-36 pb-14 md:pt-44 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_70%_at_50%_0%,rgb(242_107_58/0.45),transparent_70%)]"
        />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>
        <h1 className="mt-6 text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] font-bold tracking-tight">
          All <span className="font-serif font-normal italic">projects</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          {text?.description || "Every project, start to finish."}{" "}
          {projects.length > 0 && `${projects.length} total.`}
        </p>
      </header>

      <section className="section-x pb-24 md:pb-32" aria-label="All projects">
        {projects.length === 0 ? (
          <p className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white/60">
            No projects published yet — check back soon.
          </p>
        ) : (
          <ol className="grid gap-6 md:grid-cols-2 xl:gap-8">
            {projects.map((p, i) => {
              const theme = CARD_THEMES[p.card_theme];
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className={cn(
                      "group scroll-reveal flex h-full flex-col overflow-hidden rounded-[2rem] p-5 shadow-[0_-20px_60px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out hover:-translate-y-1.5 md:p-7",
                      theme.bg,
                      theme.dark ? "text-white" : "text-ink",
                    )}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-black/10">
                      {p.cover_image ? (
                        <FitImage
                          src={p.cover_image}
                          alt={`${p.title} ${p.title_accent} preview`}
                          sizes="(min-width: 768px) 45vw, 100vw"
                          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#101024,#2b1a5c)] p-6 text-center">
                          <span className="text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[0.3em] text-white/80 uppercase">
                            {p.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-1 pt-6">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          theme.dark ? "text-white/60" : "text-neutral-500",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(projects.length).padStart(2, "0")}
                      </p>
                      <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.05] font-bold tracking-tight">
                        {p.title}{" "}
                        {p.title_accent && (
                          <span className="font-serif font-normal italic">
                            {p.title_accent}
                          </span>
                        )}
                      </h2>
                      {p.short_description && (
                        <p
                          className={cn(
                            "mt-3 line-clamp-3 max-w-md text-sm leading-relaxed",
                            theme.dark ? "text-white/75" : "text-neutral-700",
                          )}
                        >
                          {p.short_description}
                        </p>
                      )}
                      {p.tags.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {p.tags.slice(0, 5).map((t) => (
                            <li
                              key={t}
                              className={cn(
                                "rounded-full border px-3.5 py-1 text-xs font-medium backdrop-blur-md",
                                theme.dark
                                  ? "border-white/25 bg-white/10"
                                  : "border-white/80 bg-white/55",
                              )}
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="mt-6 inline-flex items-center gap-2 pt-2 text-sm font-semibold">
                        View case study
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </article>
  );
}
