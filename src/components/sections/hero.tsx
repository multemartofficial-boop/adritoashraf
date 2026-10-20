import { getImageProps } from "next/image";
import { ArrowRight, Check } from "lucide-react";
import type { SiteSettingsRow } from "@/types/database";
import { HERO_IMAGE } from "@/lib/site-config";
import { site } from "@/config/site";

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
          <div className="animate-reveal mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: "440ms" }}>
            <a
              href="#book"
              className="bg-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgb(123_79_255/0.4)] transition-transform duration-300 hover:scale-[1.03]"
            >
              Book a Free 15-Min Call
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href="#portfolio"
              className="text-sm font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              See my work
            </a>
          </div>
          <p className="animate-reveal mt-4 max-w-md text-xs leading-relaxed text-white/50" style={{ animationDelay: "520ms" }}>
            No obligation. You get a clear plan, timeline and estimated price after the call.
          </p>
        </div>
      </div>

      <div className="relative pb-8 md:pb-10">
        <div className="section-x" aria-label="Why clients trust me">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/75 md:text-base">
            {["4+ production systems delivered", "100% source code handover", "Fixed price, no surprises"].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="bg-orange-pill grid size-5 shrink-0 place-items-center rounded-full text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
            {site.clientLogos.map((l) => (
              <li key={l.src} className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt={l.alt} className="h-7 w-auto opacity-80" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
