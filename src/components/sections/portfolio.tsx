import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SectionText } from "@/types/database";
import type { ProjectCard } from "@/lib/data/public";
import { CARD_THEMES } from "@/components/site/card-themes";
import { FitImage } from "@/components/ui/fit-image";
import { cn } from "@/lib/utils";

export function Portfolio({
  projects,
  text,
  total,
}: {
  projects: ProjectCard[];
  text?: SectionText;
  total?: number;
}) {
  if (projects.length === 0) return null;
  const word = text?.tag || "Portfolio";
  const remaining = Math.max(0, (total ?? projects.length) - projects.length);

  return (
    <section
      id="portfolio"
      aria-label={word}
      className="relative isolate overflow-clip bg-black pb-24 text-white md:pb-32"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(70%_60%_at_50%_0%,rgb(242_107_58/0.55),transparent_70%)]"
      />

      <h2 className="section-x pt-20 text-center text-[clamp(2.5rem,13vw,17rem)] leading-[0.8] font-extrabold tracking-tighter uppercase select-none md:pt-28">
        {word}
      </h2>
      {text?.description && (
        <p className="section-x mt-4 text-center text-white/60">
          {text.description}
        </p>
      )}

      {/* Sticky stacking cards: each card pins slightly lower than the previous one. */}
      <ol className="section-x relative -mt-[clamp(1.5rem,4vw,4rem)] space-y-[12vh]">
        {projects.map((p, i) => {
          const theme = CARD_THEMES[p.card_theme];
          return (
            <li
              key={p.id}
              className="sticky"
              style={{ top: `calc(6rem + ${i * 1.75}rem)` }}
            >
              <Link
                href={`/projects/${p.slug}`}
                className={cn(
                  "group scroll-reveal grid overflow-hidden rounded-[2rem] p-5 shadow-[0_-20px_60px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out md:grid-cols-[1fr_1.15fr] md:gap-8 md:p-8 lg:min-h-[70vh] lg:p-10",
                  theme.bg,
                  theme.dark ? "text-white" : "text-ink",
                )}
              >
                <div className="flex flex-col justify-between gap-8 p-1 md:py-4">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        theme.dark ? "text-white/60" : "text-neutral-500",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(projects.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4.2vw,4rem)] leading-[1.05] font-bold tracking-tight">
                      {p.title}{" "}
                      {p.title_accent && (
                        <span className="font-serif font-normal italic">
                          {p.title_accent}
                        </span>
                      )}
                    </h3>
                    {p.short_description && (
                      <p
                        className={cn(
                          "mt-4 max-w-md text-sm leading-relaxed md:text-base",
                          theme.dark ? "text-white/75" : "text-neutral-700",
                        )}
                      >
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
                          <dt
                            className={cn(
                              "text-xs font-medium tracking-wide uppercase",
                              theme.dark ? "text-white/50" : "text-neutral-500",
                            )}
                          >
                            Role
                          </dt>
                          <dd className="mt-1 text-sm font-semibold">
                            {p.role}
                          </dd>
                        </div>
                      )}
                      {p.duration && (
                        <div>
                          <dt
                            className={cn(
                              "text-xs font-medium tracking-wide uppercase",
                              theme.dark ? "text-white/50" : "text-neutral-500",
                            )}
                          >
                            Timeline
                          </dt>
                          <dd className="mt-1 text-sm font-semibold">
                            {p.duration}
                          </dd>
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
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      View case study
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>

                <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-black/10 md:mt-0 md:aspect-auto md:min-h-80">
                  {p.cover_image ? (
                    <FitImage
                      src={p.cover_image}
                      alt={`${p.title} ${p.title_accent} preview`}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#101024,#2b1a5c)] p-6 text-center">
                      <span className="text-[clamp(1.75rem,4vw,3.5rem)] font-light tracking-[0.3em] text-white/80 uppercase">
                        {p.title}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-20 flex justify-center md:mt-24">
        <Link
          href="/projects"
          className="group glass inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-colors duration-300 hover:border-white hover:bg-white hover:text-ink"
        >
          View all projects
          {remaining > 0 && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs transition-colors duration-300 group-hover:bg-ink/10">
              {remaining} more
            </span>
          )}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
