"use client";

import { useSyncExternalStore } from "react";
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
    <div role="radiogroup" aria-label="Currency" className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1">
      {(["USD", "BDT"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
            value === c ? "bg-ink text-white shadow" : "text-neutral-600 hover:text-ink",
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
  // The visitor's last choice lives in localStorage; the server renders the admin default.
  const stored = useSyncExternalStore(subscribe, () => localStorage.getItem(STORAGE_KEY), () => null);
  const currency: Currency = stored === "USD" || stored === "BDT" ? stored : defaultCurrency;

  const choose = (c: Currency) => {
    localStorage.setItem(STORAGE_KEY, c);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  if (services.length === 0) return null;

  return (
    <section id="services" className="section-x flex min-h-svh flex-col justify-center gap-12 bg-white py-24 text-ink md:py-32">
      <SectionHeading text={text} aside={<CurrencyToggle value={currency} onChange={choose} />} />

      <div
        className={cn(
          "scroll-reveal mx-auto w-full rounded-[2.25rem] bg-[linear-gradient(160deg,#f5f0ff_0%,#fff1ea_100%)] p-2.5 sm:p-3",
          services.length <= 2 ? "max-w-4xl" : services.length === 3 ? "max-w-6xl" : "max-w-7xl",
        )}
      >
        <ul
          className={cn(
            "grid gap-2.5 sm:gap-3",
            services.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-2",
            services.length === 3 && "lg:grid-cols-3",
            services.length >= 4 && "xl:grid-cols-4",
          )}
        >
          {services.map((s, i) => (
            <li
              key={s.id}
              className="card-lift flex flex-col rounded-[1.75rem] bg-white p-6 shadow-[0_6px_30px_rgb(11_11_18/0.05)] hover:shadow-[0_20px_50px_rgb(123_79_255/0.14)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="bg-orange-pill grid size-12 place-items-center rounded-2xl text-white shadow-lg shadow-orange/20">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                <span className="tag-pill text-xs tabular-nums text-neutral-500">
                  {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight">{s.title}</h3>
              {s.description && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.description}</p>}

              <div className="mt-6 rounded-2xl bg-neutral-50 p-5">
                <span className="block text-xs text-neutral-500">Starting from</span>
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
                      <li key={inc} className="flex gap-2.5">
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-violet/10">
                          <Check className="size-2.5 text-violet" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="text-neutral-700">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-auto pt-8">
                <Link
                  href={`/book?service=${encodeURIComponent(s.slug)}`}
                  className="bg-cta flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02]"
                >
                  Book a meeting about this <ArrowUpRight className="size-4" />
                </Link>
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
