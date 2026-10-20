"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom bar on mobile: appears after scrolling past the hero and
 * hides while the booking section (#book) is on screen.
 */
export function StickyBookCta() {
  const [pastHero, setPastHero] = useState(false);
  const [bookVisible, setBookVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const book = document.getElementById("book");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target.id === "home") setPastHero(!e.isIntersecting);
          if (e.target.id === "book") setBookVisible(e.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
    if (hero) obs.observe(hero);
    if (book) obs.observe(book);
    return () => obs.disconnect();
  }, []);

  const show = pastHero && !bookVisible;
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!show}
    >
      <Link
        href="/book"
        tabIndex={show ? 0 : -1}
        className="bg-cta flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgb(123_79_255/0.4)]"
      >
        Book a Free 15-Min Call <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
