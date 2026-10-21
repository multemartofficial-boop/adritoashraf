"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Dialog as D } from "radix-ui";
import { CalendarClock, ShieldCheck, Sparkles, Timer, X } from "lucide-react";
import { publicEnv } from "@/lib/env/public";

const BOOK_PATH = "/book";

function MiniCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarClock;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <Icon className="size-5 text-orange" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-white/60">{text}</p>
    </div>
  );
}

export function BookingWidgetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const widgetUrl = useMemo(() => publicEnv.NEXT_PUBLIC_BOOKING_WIDGET_URL?.trim() || BOOK_PATH, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const isBookLink = href === "#book" || href.startsWith(BOOK_PATH);
      if (!isBookLink) return;

      event.preventDefault();
      setOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      {children}

      <D.Root open={open} onOpenChange={setOpen}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" />
          <D.Content className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-[min(96vw,78rem)] -translate-y-1/2 outline-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090914] text-white shadow-[0_40px_120px_rgb(0_0_0/0.65)]">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_20%,rgb(123_79_255/0.32),transparent_65%),radial-gradient(50%_50%_at_85%_0%,rgb(244_166_200/0.18),transparent_60%)]" />
              <div className="relative grid h-[min(88vh,56rem)] lg:grid-cols-[0.92fr_1.08fr]">
                <div className="flex h-full flex-col gap-6 overflow-y-auto p-6 md:p-8 lg:p-10">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgb(74_222_128/0.8)]" />
                      Live availability
                    </span>
                    <span className="text-xs uppercase tracking-[0.22em] text-white/45">Book in seconds</span>
                  </div>

                  <div className="space-y-4">
                    <p className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-normal italic text-white/95">
                      Book a Free 15-Min Call
                    </p>
                    <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                      Jump straight into a focused discovery call. We’ll cover goals, scope, timeline, and the fastest way to turn the idea into a clean build.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MiniCard icon={Sparkles} title="Strategy first" text="We clarify the problem before talking features or budget." />
                    <MiniCard icon={Timer} title="Short and focused" text="A quick 15-minute slot keeps it efficient for both sides." />
                    <MiniCard icon={ShieldCheck} title="Clear next step" text="You leave with a plan, timeline, and practical recommendation." />
                  </div>

                  <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">What happens next</p>
                    <ol className="mt-3 space-y-2 text-sm text-white/75">
                      <li>1. I review your brief and project goals.</li>
                      <li>2. We map out the solution, scope, and timeline.</li>
                      <li>3. You get a clear next step with no pressure.</li>
                    </ol>
                  </div>
                </div>

                <div className="border-t border-white/10 lg:border-t-0 lg:border-l">
                  <div className="flex h-full min-h-[28rem] flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <CalendarClock className="size-4 text-orange" aria-hidden />
                        Scheduling widget
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/45">
                        {publicEnv.NEXT_PUBLIC_BOOKING_WIDGET_URL ? "Calendly / Cal.com" : "Internal booking flow"}
                      </span>
                    </div>
                    <iframe
                      title="Booking widget"
                      src={widgetUrl}
                      className="min-h-0 flex-1 w-full bg-white"
                      allow="camera; microphone; fullscreen; autoplay"
                    />
                  </div>
                </div>
              </div>

              <D.Close
                className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-colors hover:bg-white/18"
                aria-label="Close booking widget"
              >
                <X className="size-5" />
              </D.Close>
            </div>
          </D.Content>
        </D.Portal>
      </D.Root>
    </>
  );
}
