"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog as D } from "radix-ui";
import { ArrowRight, ArrowUpRight, Eye, X } from "lucide-react";
import type { SectionText } from "@/types/database";
import type { ProjectCard } from "@/lib/data/public";
import { CARD_THEMES } from "@/components/site/card-themes";
import { FitImage } from "@/components/ui/fit-image";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

export function Portfolio({
  projects,
  text,
  total,
}: {
  projects: ProjectCard[];
  text?: SectionText;
  total?: number;
}) {
  const [preview, setPreview] = useState<ProjectCard | null>(null);
  const word = text?.tag || "Portfolio";
  const remaining = Math.max(0, (total ?? projects.length) - projects.length);
  const previewResults = useMemo(() => (preview ? site.caseStudyResults[preview.slug] ?? [] : []), [preview]);

  if (projects.length === 0) return null;

  return (
    <section id="portfolio" aria-label={word} className="relative isolate overflow-clip bg-black pb-24 text-white md:pb-32">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(70%_60%_at_50%_0%,rgb(242_107_58/0.55),transparent_70%)]"
      />

      <h2 className="section-x pt-20 text-center text-[clamp(2.5rem,13vw,17rem)] leading-[0.8] font-extrabold tracking-tighter uppercase select-none md:pt-28">
        {word}
      </h2>
      {text?.description && <p className="section-x mt-4 text-center text-white/60">{text.description}</p>}

      <ol className="section-x relative -mt-[clamp(1.5rem,4vw,4rem)] space-y-[12vh]">
        {projects.map((p, i) => {
          const theme = CARD_THEMES[p.card_theme];
          return (
            <li key={p.id} className="sticky [perspective:1400px]" style={{ top: `calc(6rem + ${i * 1.75}rem)` }}>
              <article
                className={cn(
                  "group/card relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[0_-20px_60px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out will-change-transform hover:[transform:translateY(-8px)_rotateX(2deg)_rotateY(-2deg)] md:grid md:grid-cols-[1fr_1.12fr] md:gap-8 md:p-8 lg:min-h-[70vh] lg:p-10",
                  theme.bg,
                  theme.dark ? "text-white" : "text-ink",
                )}
              >
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgb(123_79_255/0.16),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
                <div className="absolute inset-0 border border-white/5 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

                <div className="relative flex flex-col justify-between gap-8 p-1 md:py-4">
                  <div>
                    <p className={cn("text-sm font-medium", theme.dark ? "text-white/60" : "text-neutral-500")}>
                      {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4.2vw,4rem)] leading-[1.05] font-bold tracking-tight">
                      {p.title}{" "}
                      {p.title_accent && <span className="font-serif font-normal italic">{p.title_accent}</span>}
                    </h3>
                    {p.short_description && (
                      <p className={cn("mt-4 max-w-md text-sm leading-relaxed md:text-base", theme.dark ? "text-white/75" : "text-neutral-700")}>
                        {p.short_description}
                      </p>
                    )}
                  </div>

                  {(p.role || p.duration) && (
                    <dl
                      className={cn(
                        "grid max-w-md grid-cols-2 gap-4 border-t pt-5",
                        theme.dark ? "border-white/15" : "border-ink/10",
                      )}
                    >
                      {p.role && (
                        <div>
                          <dt className={cn("text-xs font-medium tracking-wide uppercase", theme.dark ? "text-white/50" : "text-neutral-500")}>
                            Role
                          </dt>
                          <dd className="mt-1 text-sm font-semibold">{p.role}</dd>
                        </div>
                      )}
                      {p.duration && (
                        <div>
                          <dt className={cn("text-xs font-medium tracking-wide uppercase", theme.dark ? "text-white/50" : "text-neutral-500")}>
                            Timeline
                          </dt>
                          <dd className="mt-1 text-sm font-semibold">{p.duration}</dd>
                        </div>
                      )}
                    </dl>
                  )}

                  <div className="space-y-6">
                    {p.tags.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <li
                            key={t}
                            className={cn(
                              "rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md",
                              theme.dark ? "border-white/25 bg-white/10" : "border-white/80 bg-white/55",
                            )}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-[0_12px_28px_rgb(11_11_18/0.14)] transition-transform duration-200 hover:scale-[1.02]"
                      >
                        View case study <ArrowRight className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPreview(p)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
                          theme.dark ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-white/75 bg-white/60 text-ink hover:border-white hover:bg-white",
                        )}
                      >
                        <Eye className="size-4" />
                        Live preview
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/10 md:mt-0 md:aspect-auto md:min-h-80">
                  {site.projects[p.slug]?.isDemoData && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm">
                      Demo data
                    </span>
                  )}
                  {p.cover_image ? (
                    <FitImage
                      src={p.cover_image}
                      alt={p.cover_image_alt || `${p.title} preview`}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#101024,#2b1a5c)] p-6 text-center">
                      <span className="text-[clamp(1.75rem,4vw,3.5rem)] font-light tracking-[0.3em] text-white/80 uppercase">
                        {p.title}
                      </span>
                    </div>
                  )}
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(0_0_0/0.2))]" />
                  <span className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                    Quick preview
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <div className="mt-20 flex justify-center md:mt-24">
        <Link
          href="/projects"
          className="group glass inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:border-white hover:bg-white hover:text-ink"
        >
          View all projects
          {remaining > 0 && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs transition-colors duration-300 group-hover:bg-ink/10">
              {remaining} more
            </span>
          )}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <D.Root open={preview !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md" />
          <D.Content className="fixed top-1/2 left-1/2 z-[70] w-[min(96vw,82rem)] -translate-x-1/2 -translate-y-1/2 outline-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090914] text-white shadow-[0_40px_100px_rgb(0_0_0/0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_20%,rgb(123_79_255/0.32),transparent_65%),radial-gradient(50%_50%_at_85%_0%,rgb(244_166_200/0.14),transparent_60%)]" />
              <div className="relative grid h-[min(88vh,56rem)] lg:grid-cols-[0.92fr_1.08fr]">
                <div className="flex h-full flex-col gap-5 overflow-y-auto p-6 md:p-8 lg:p-10">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                      Live case study
                    </span>
                    <span className="text-xs uppercase tracking-[0.22em] text-white/40">{preview?.slug}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="font-serif text-[clamp(2.3rem,4.5vw,4rem)] leading-none font-normal italic text-white/95">
                      {preview?.title} {preview?.title_accent}
                    </p>
                    <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                      {preview?.short_description}
                    </p>
                  </div>

                  {previewResults.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {previewResults.map((r) => (
                        <div key={r.label} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                          <p className="text-2xl font-bold tracking-tight text-orange">{r.value}</p>
                          <p className="mt-1 text-sm text-white/65">{r.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {preview?.tags.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {preview.tags.map((tag) => (
                        <li key={tag} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/75">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {preview?.role || preview?.duration ? (
                    <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-white/75 backdrop-blur-xl sm:grid-cols-2">
                      {preview?.role && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Role</p>
                          <p className="mt-1 font-semibold text-white">{preview.role}</p>
                        </div>
                      )}
                      {preview?.duration && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Timeline</p>
                          <p className="mt-1 font-semibold text-white">{preview.duration}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Why this matters</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">
                      This preview gives high-ticket clients a fast look at the product quality, UI polish, and the kind of experience they can expect.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 lg:border-t-0 lg:border-l">
                  <div className="flex h-full min-h-[28rem] flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Eye className="size-4 text-orange" aria-hidden />
                        Live frame preview
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/45">
                        {preview?.live_url ? "Production URL" : "Cover preview"}
                      </span>
                    </div>
                    <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
                      {preview?.live_url ? (
                        <iframe
                          src={preview.live_url}
                          title={`${preview.title} live preview`}
                          className="h-full w-full"
                          allow="fullscreen"
                        />
                      ) : preview?.cover_image ? (
                        <FitImage
                          src={preview.cover_image}
                          alt={preview.cover_image_alt || `${preview.title} cover`}
                          sizes="100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#101024,#2b1a5c)] p-6 text-center text-white">
                          <span className="text-[clamp(1.75rem,4vw,3.5rem)] font-light tracking-[0.3em] uppercase opacity-70">
                            {preview?.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <D.Close className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-colors hover:bg-white/18" aria-label="Close preview">
                <X className="size-5" />
              </D.Close>
            </div>
          </D.Content>
        </D.Portal>
      </D.Root>
    </section>
  );
}
