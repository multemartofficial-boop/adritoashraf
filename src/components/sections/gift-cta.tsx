import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { getPublishedLandingPages } from "@/lib/data/public";

/** Compact band after the booking section that promotes the live gift page. */
export async function GiftCta() {
  const pages = await getPublishedLandingPages();
  const page = pages[0];
  if (!page) return null;

  return (
    <section className="section-x bg-white pb-16 text-ink">
      <Link
        href={`/${page.slug}`}
        className="scroll-reveal bg-holo group mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-violet/25 py-3 pr-3 pl-6 transition-all duration-300 hover:border-violet/50 hover:shadow-[0_0_28px_rgb(124_77_255/0.15)]"
      >
        <span className="flex min-w-0 items-center gap-3 text-sm md:text-base">
          <span className="bg-orange-pill grid size-8 shrink-0 place-items-center rounded-full text-white">
            <Gift className="size-4" />
          </span>
          <span className="truncate">
            <span className="font-semibold">
              {page.pill_text || "Free gift"}:
            </span>{" "}
            <span className="text-neutral-600">{page.internal_name}</span>
          </span>
        </span>
        <span className="bg-cta inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-transform duration-300 group-hover:scale-[1.04]">
          Get it free{" "}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </section>
  );
}
