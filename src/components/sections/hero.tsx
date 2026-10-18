import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import type { SiteSettingsRow } from "@/types/database";
import { HERO_IMAGE } from "@/lib/site-config";

const MARQUEE_COLORS = ["bg-violet", "bg-orange", "bg-emerald-500", "bg-sky-500", "bg-pink-500", "bg-amber-400"];

function HeroBackground() {
  const common = { alt: "", sizes: "100vw", priority: true } as const;
  const { props: desktop } = getImageProps({ ...common, src: HERO_IMAGE.desktop, width: 2400, height: 1351 });
  const { props: mobile } = getImageProps({ ...common, src: HERO_IMAGE.mobile, width: 1080, height: 608 });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop.srcSet ?? desktop.src} />
      <source media="(max-width: 767px)" srcSet={mobile.srcSet ?? mobile.src} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...desktop} className="absolute inset-0 size-full object-cover object-[70%_center] md:object-right" />
    </picture>
  );
}

export function Hero({ settings: s }: { settings: SiteSettingsRow }) {
  const items = s.marquee_items.length ? s.marquee_items : [s.role];

  return (
    <section id="home" aria-label="Introduction" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink text-white">
      <HeroBackground />
      {/* Darken the left side so the headline always stays readable over the artwork. */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#0b0b12_0%,rgb(11_11_18/0.85)_35%,rgb(11_11_18/0.2)_70%,transparent_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="section-x relative flex flex-1 flex-col justify-center pt-32 pb-10 md:pt-36">
        <div className="max-w-[min(100%,68rem)]">
          <p className="animate-reveal font-serif text-[clamp(1.75rem,3.4vw,3.25rem)] leading-none italic">{s.hero_intro}</p>
          <h1 className="mt-3 font-extrabold tracking-tight uppercase">
            <span
              className="animate-reveal text-gradient-lavender block text-[clamp(1.8rem,8vw,8rem)] leading-[0.92]"
              style={{ animationDelay: "120ms" }}
            >
              {s.hero_line_1}
            </span>
            <span className="animate-reveal mt-2 flex items-center gap-2 sm:gap-3 md:gap-5" style={{ animationDelay: "240ms" }}>
              <a
                href="#about"
                aria-label="Scroll to the About section"
                className="bg-orange-pill group/pill inline-grid h-[clamp(2rem,4.8vw,5.5rem)] w-[clamp(3.4rem,9.5vw,11rem)] shrink-0 place-items-center rounded-full shadow-[0_10px_40px_rgb(242_107_58/0.35)] transition-all duration-300 ease-out hover:scale-[1.06] hover:shadow-[0_14px_50px_rgb(244_166_200/0.5)] focus-visible:outline-2 focus-visible:outline-white active:scale-95"
              >
                <ArrowRight className="size-[45%] stroke-[2.5] transition-transform duration-300 ease-out group-hover/pill:translate-x-1" />
              </a>
              <span className="text-gradient-peach min-w-0 text-[clamp(1.8rem,8vw,8rem)] leading-[0.92] whitespace-nowrap">{s.hero_line_2}</span>
            </span>
          </h1>
          {s.tagline && (
            <p className="animate-reveal mt-8 max-w-lg text-base leading-relaxed text-white/70 md:text-lg" style={{ animationDelay: "360ms" }}>
              {s.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="relative pb-8 md:pb-10">
        <div className="mask-fade-x overflow-hidden" aria-label="Technologies I work with">
          <ul className="animate-marquee flex w-max gap-12 pr-12 motion-reduce:animate-none md:gap-16 md:pr-16">
            {[...items, ...items].map((item, i) => (
              <li
                key={`${item}-${i}`}
                aria-hidden={i >= items.length || undefined}
                className="flex shrink-0 items-center gap-3 text-base font-semibold text-white/85 md:text-lg"
              >
                <span className={`grid size-7 place-items-center rounded-lg text-xs font-bold text-white ${MARQUEE_COLORS[i % MARQUEE_COLORS.length]}`}>
                  {item.charAt(0)}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
