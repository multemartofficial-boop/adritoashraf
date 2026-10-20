import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Repeated primary CTA strip between home sections. */
export function BookCtaStrip({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className={cn("section-x py-4 text-center", tone === "light" ? "bg-white text-ink" : "bg-ink text-white")}>
      <Link
        href="/book"
        className="bg-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)] transition-transform duration-200 hover:scale-[1.03]"
      >
        Book a Free 15-Min Call <ArrowRight className="size-4" aria-hidden />
      </Link>
      <p className={cn("mt-2 text-xs", tone === "light" ? "text-neutral-500" : "text-white/55")}>
        Fixed price • Full source code • 4+ systems delivered
      </p>
    </div>
  );
}
