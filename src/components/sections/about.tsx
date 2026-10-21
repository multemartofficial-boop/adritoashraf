import { getImageProps } from "next/image";
import { Quote, Sparkles } from "lucide-react";
import type { SiteSettingsRow, TestimonialRow } from "@/types/database";
import { HERO_IMAGE } from "@/lib/site-config";
import { site } from "@/config/site";
import { CountUp } from "@/components/site/count-up";
import { SectionTag, TriHeading } from "@/components/site/section-heading";

export function About({ settings: s, featured }: { settings: SiteSettingsRow; featured?: TestimonialRow }) {
  const [a, b, c] = s.about_stats;
  const quote = s.about_quote || featured?.content || s.tagline;
  const quoteAuthor = s.about_quote ? s.about_quote_author : featured?.client_name;
  const { props: photo } = getImageProps({
    src: featured?.poster_url || featured?.avatar_url || HERO_IMAGE.mobile,
    alt: "",
    width: 1080,
    height: 1080,
    sizes: "(min-width: 1024px) 33vw, 100vw",
  });

  return (
    <section id="results" className="section-x flex min-h-svh flex-col justify-center gap-14 bg-white py-24 text-ink md:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <SectionTag>Results</SectionTag>
          <TriHeading text={s.about_heading} />
          {s.about_text && <p className="max-w-xl leading-relaxed text-neutral-600">{s.about_text}</p>}
        </div>
        {/* Space reserved for the twisted glass 3D object (Phase 8). */}
        <div aria-hidden className="relative hidden aspect-square max-h-80 justify-self-end lg:block">
          <div className="absolute inset-[15%] rounded-full bg-[conic-gradient(from_200deg,#f26b3a,#c9b6ff,#7b4fff,#f4a6c8,#f26b3a)] opacity-40 blur-3xl" />
        </div>
      </div>

      {(a || b || c || quote) && (
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {a && (
            <article className="card-lift scroll-reveal group relative flex min-h-80 flex-col overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#ede6ff_0%,#f6d9ee_100%)] p-6 hover:shadow-[0_24px_50px_rgb(123_79_255/0.18)]">
              <span className="bg-orange-pill grid size-11 place-items-center rounded-xl text-white transition-transform duration-300 ease-out group-hover:scale-110">
                <Sparkles className="size-5" />
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight tabular-nums">
                <CountUp value={a.value} />
              </p>
              <p className="mt-2 max-w-60 text-sm text-neutral-700">{a.label}</p>
              <div aria-hidden className="bg-holo absolute inset-x-0 bottom-0 h-2/5 opacity-90 [mask-image:linear-gradient(to_top,#000_40%,transparent)]" />
            </article>
          )}

          {(b || c) && (
            <div className="grid min-h-80 gap-4 md:gap-5">
              {b && (
                <article className="card-lift scroll-reveal flex flex-col justify-between rounded-[1.75rem] bg-[linear-gradient(120deg,#141633_0%,#3a2050_55%,#f26b3a_130%)] p-6 text-white hover:shadow-[0_24px_50px_rgb(11_11_18/0.35)]">
                  <div className="flex -space-x-2" aria-hidden>
                    {["bg-orange", "bg-violet", "bg-pink-400", "bg-sky-400"].map((bg) => (
                      <span key={bg} className={`size-9 rounded-full border-2 border-[#1d1838] ${bg}`} />
                    ))}
                  </div>
                  <p className="mt-6">
                    <span className="text-3xl font-bold tabular-nums">
                      <CountUp value={b.value} />
                    </span>
                    <span className="mt-1 block text-sm text-white/75">{b.label}</span>
                  </p>
                </article>
              )}
              {c && (
                <article className="card-lift scroll-reveal flex items-center gap-4 rounded-[1.75rem] bg-[linear-gradient(120deg,#ffe7dc_0%,#f9c3d8_100%)] p-6 hover:shadow-[0_24px_50px_rgb(244_166_200/0.35)]">
                  <span className="text-5xl font-bold tracking-tight text-pink-500 tabular-nums">
                    <CountUp value={c.value} />
                  </span>
                  <span className="text-sm text-neutral-700">
                    {c.label}
                    <span className="mt-1 block text-xs text-neutral-500">{site.resultsCaption || "Based on client feedback"}</span>
                  </span>
                </article>
              )}
            </div>
          )}

          {quote && (
            <article className="card-lift scroll-reveal group relative min-h-80 overflow-hidden rounded-[1.75rem] bg-ink hover:shadow-[0_24px_50px_rgb(11_11_18/0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img
                {...photo}
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(244_166_200/0.25),rgb(123_79_255/0.25))]" />
              <span className="glass absolute top-5 left-5 grid size-11 place-items-center rounded-xl text-white">
                <Quote className="size-5" />
              </span>
              <blockquote className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 text-sm leading-relaxed text-neutral-800 shadow-xl">
                “{quote.length > 150 ? `${quote.slice(0, 147)}…` : quote}”
                {quoteAuthor && <footer className="mt-2 text-xs font-semibold text-ink">{quoteAuthor}</footer>}
              </blockquote>
            </article>
          )}
        </div>
      )}
    </section>
  );
}
