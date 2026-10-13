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

      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((s, i) => (
          <li
            key={s.id}
            className={cn(
              "card-lift scroll-reveal flex flex-col rounded-[1.75rem] border border-neutral-100 p-6 shadow-[0_10px_40px_rgb(11_11_18/0.06)] hover:shadow-[0_24px_50px_rgb(123_79_255/0.14)]",
              i % 2 === 0
                ? "bg-[linear-gradient(160deg,#f5f0ff_0%,#ffffff_55%)]"
                : "bg-[linear-gradient(160deg,#fff1ea_0%,#ffffff_55%)]",
            )}
          >
            <span className="bg-orange-pill grid size-12 place-items-center rounded-2xl text-white shadow-lg shadow-orange/20">
              <ServiceIcon name={s.icon} className="size-5" />
            </span>
            <h3 className="mt-5 text-xl font-bold tracking-tight">{s.title}</h3>
            {s.description && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.description}</p>}

            {s.includes.length > 0 && (
              <ul className="mt-5 space-y-2 text-sm">
                {s.includes.map((inc) => (
                  <li key={inc} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-violet" aria-hidden />
                    <span className="text-neutral-700">{inc}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto space-y-4 pt-6">
              <div className="flex items-end justify-between gap-3 border-t border-neutral-200/70 pt-4">
                <p>
                  <span className="block text-xs text-neutral-500">Starting from</span>
                  <span className="text-2xl font-bold tracking-tight" aria-live="polite">
                    {formatPrice(currency === "USD" ? s.price_usd : s.price_bdt, currency)}
                  </span>
                </p>
                {s.timeline && (
                  <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="size-3.5" aria-hidden /> {s.timeline}
                  </span>
                )}
              </div>
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
    </section>
  );
}
