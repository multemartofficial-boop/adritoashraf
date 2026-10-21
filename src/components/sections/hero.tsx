import { ArrowRight, Check, Code2, Layers3, Sparkles, Zap } from "lucide-react";
import type { SiteSettingsRow } from "@/types/database";

const WORKSPACE_LINES = [
  { label: "architecture", value: "clean systems" },
  { label: "delivery", value: "fast build cycles" },
  { label: "focus", value: "SaaS • ERP • Web apps" },
] as const;

export function Hero({ settings: s }: { settings: SiteSettingsRow }) {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative isolate overflow-hidden bg-[#060610] text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgb(123_79_255/0.28),transparent_65%),radial-gradient(50%_50%_at_85%_18%,rgb(244_166_200/0.18),transparent_55%),linear-gradient(180deg,#060610_0%,#090912_60%,#060610_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:96px_96px]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060610] to-transparent" />

      <div className="section-x relative grid min-h-svh items-center gap-14 py-28 lg:grid-cols-[1.05fr_0.95fr] lg:py-36">
        <div className="max-w-3xl">
          <div className="animate-reveal inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300 shadow-[0_0_30px_rgb(16_185_129/0.18)]">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            Available for Q4 Projects
          </div>

          <p className="animate-reveal mt-6 font-serif text-[clamp(1.75rem,3.6vw,3.5rem)] leading-none font-normal italic text-white/80" style={{ animationDelay: "120ms" }}>
            {s.hero_intro}
          </p>

          <h1 className="mt-4 font-extrabold tracking-tight uppercase">
            <span
              className="animate-reveal block text-[clamp(2.75rem,8.5vw,8.5rem)] leading-[0.88] text-gradient-lavender"
              style={{ animationDelay: "180ms" }}
            >
              {s.hero_line_1}
            </span>
            <span
              className="animate-reveal mt-2 block text-[clamp(2.75rem,8.5vw,8.5rem)] leading-[0.88] text-gradient-peach"
              style={{ animationDelay: "280ms" }}
            >
              {s.hero_line_2}
            </span>
          </h1>

          {s.tagline && (
            <p
              className="animate-reveal mt-7 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg"
              style={{ animationDelay: "380ms" }}
            >
              {s.tagline}
            </p>
          )}

          <div className="animate-reveal mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: "460ms" }}>
            <a
              href="#book"
              className="group inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#7b4fff_0%,#b44cff_55%,#f7b6a0_100%)] px-7 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgb(123_79_255/0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgb(123_79_255/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Book a Free 15-Min Call
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </a>
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/85 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              See My Work
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>

          <p className="animate-reveal mt-4 max-w-md text-xs leading-relaxed text-white/48" style={{ animationDelay: "540ms" }}>
            No obligation. You get a clear plan, timeline and estimated price after the call.
          </p>
        </div>

        <div className="relative lg:pl-6">
          <div aria-hidden className="absolute inset-0 -z-10 translate-x-8 translate-y-8 rounded-full bg-violet/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-[0_30px_80px_rgb(0_0_0/0.35)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-1 pb-4">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="size-3 rounded-full bg-white/20" />
                <span className="size-3 rounded-full bg-violet/70" />
                <span className="size-3 rounded-full bg-orange/70" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <Code2 className="size-3.5" aria-hidden />
                Developer workstation
              </span>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(123,79,255,0.08))] p-6 md:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_20%,rgb(244_166_200/0.18),transparent_55%)]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="max-w-[22rem]">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">Shipping stack</p>
                    <p className="mt-2 text-[clamp(1.5rem,2vw,2.15rem)] leading-tight font-semibold text-white">
                      Premium software that feels polished from day one
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/68">
                      Designed to feel premium, ship fast, and stay clear for founders, operators, and teams.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <Sparkles className="size-3.5" aria-hidden />
                    Live
                  </span>
                </div>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { title: "Plan", value: "Discovery → proposal" },
                    { title: "Design", value: "Clear UI direction" },
                    { title: "Delivery", value: "Fast, tested launch" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {WORKSPACE_LINES.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-white/88">{item.value}</p>
                    </div>
                    <Layers3 className="size-4 shrink-0 text-white/40" aria-hidden />
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap className="size-4 text-orange" aria-hidden />
                  Built for serious clients
                </div>
                <ul className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-3">
                  <li className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
                    Clear scoping for SaaS, ERP, and internal tools
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
                    High-end UI, smooth micro-interactions, and fast delivery
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
                    Full source code, handover, and post-launch support
                  </li>
                </ul>
              </div>
            </div>

            <div className="absolute top-6 right-6 hidden rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300 lg:inline-flex">
              🟢 Available for Q4 Projects
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
