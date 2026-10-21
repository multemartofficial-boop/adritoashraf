"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import type { Currency, SectionText, ServiceRow } from "@/types/database";
import { formatPrice } from "@/lib/money";
import { ServiceIcon } from "@/components/service-icon";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "currency";
const CHANGE_EVENT = "currency-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function CurrencyToggle({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div role="radiogroup" aria-label="Currency" className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 shadow-[0_12px_30px_rgb(11_11_18/0.08)] backdrop-blur-xl">
      {(["USD", "BDT"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
            value === c
              ? "bg-ink text-white shadow-[0_10px_24px_rgb(11_11_18/0.24)]"
              : "text-neutral-600 hover:text-ink",
          )}
        >
          {c === "USD" ? "$ USD" : "৳ BDT"}
        </button>
      ))}
    </div>
  );
}

export function Services({
  services,
  text,
  defaultCurrency,
}: {
  services: ServiceRow[];
  text?: SectionText;
  defaultCurrency: Currency;
}) {
  const stored = useSyncExternalStore(subscribe, () => localStorage.getItem(STORAGE_KEY), () => null);
  const currency: Currency = stored === "USD" || stored === "BDT" ? stored : defaultCurrency;
  const [selected, setSelected] = useState<string>("all");

  const tabs = useMemo(
    () => [
      { value: "all", label: `All packages (${services.length})` },
      ...services.map((s) => ({ value: s.slug, label: s.title })),
    ],
    [services],
  );

  const visible = selected === "all" ? services : services.filter((s) => s.slug === selected);

  const choose = (c: Currency) => {
    localStorage.setItem(STORAGE_KEY, c);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  if (services.length === 0) return null;

  const shellWidth =
    visible.length <= 2 ? "max-w-4xl" : visible.length === 3 ? "max-w-6xl" : "max-w-7xl";

  return (
    <section id="services" className="section-x flex min-h-svh flex-col justify-center gap-10 bg-white py-24 text-ink md:py-32">
      <SectionHeading text={text} aside={<CurrencyToggle value={currency} onChange={choose} />} />

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = tab.value === selected;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelected(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
                active
                  ? "border-transparent bg-ink text-white shadow-[0_12px_28px_rgb(11_11_18/0.18)]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-violet/30 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
        {selected !== "all" && (
          <button
            type="button"
            onClick={() => setSelected("all")}
            className="rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-violet underline-offset-4 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div
        className={cn(
          "scroll-reveal mx-auto w-full rounded-[2.25rem] bg-[linear-gradient(160deg,#f5f0ff_0%,#fff1ea_100%)] p-2.5 sm:p-3",
          shellWidth,
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-4 px-1 text-xs uppercase tracking-[0.22em] text-neutral-500">
          <span>{visible.length} package{visible.length === 1 ? "" : "s"} shown</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-medium text-neutral-600 backdrop-blur-xl">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Updated pricing
          </span>
        </div>

        <ul
          className={cn(
            "grid gap-2.5 sm:gap-3",
            visible.length === 1 ? "mx-auto max-w-md" : "md:grid-cols-2",
            visible.length === 3 && "lg:grid-cols-3",
            visible.length >= 4 && "xl:grid-cols-4",
          )}
        >
          {visible.map((s, i) => (
            <li
              key={s.id}
              className="group/card relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-[0_6px_30px_rgb(11_11_18/0.05)] transition-transform duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_rgb(123_79_255/0.14)] sm:p-7"
            >
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgb(123_79_255/0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#7b4fff_0%,#f4a6c8_100%)] text-white shadow-[0_10px_30px_rgb(123_79_255/0.22)]">
                    <ServiceIcon name={s.icon} className="size-5" />
                  </span>
                  <span className="tag-pill text-xs tabular-nums text-neutral-500">
                    {String(i + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">{s.title}</h3>
                {s.description && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.description}</p>}

                <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-5">
                  <span className="block text-xs uppercase tracking-[0.2em] text-neutral-500">Starting from</span>
                  <span className="mt-1 block text-3xl font-bold tracking-tight" aria-live="polite">
                    {formatPrice(currency === "USD" ? s.price_usd : s.price_bdt, currency)}
                  </span>
                  {s.timeline && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">
                      <Clock className="size-3.5 text-violet" aria-hidden /> {s.timeline}
                    </span>
                  )}
                </div>

                {s.includes.length > 0 && (
                  <>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">What&apos;s included</p>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {s.includes.map((inc) => (
                        <li key={inc} className="flex gap-2.5 text-neutral-700">
                          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-violet/10">
                            <Check className="size-2.5 text-violet" strokeWidth={3} aria-hidden />
                          </span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-auto pt-8">
                  <Link
                    href={`/book?service=${encodeURIComponent(s.slug)}`}
                    className="bg-cta flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgb(123_79_255/0.28)] transition-transform duration-200 hover:scale-[1.02]"
                  >
                    Book a meeting about this <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-sm text-neutral-600">
        Not sure what you need?{" "}
        <Link href="/book" className="font-semibold text-violet underline-offset-4 hover:underline">
          Book a free 15-min call
        </Link>
      </p>
    </section>
  );
}
