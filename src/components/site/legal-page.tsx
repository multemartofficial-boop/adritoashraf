import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Shared shell for legal pages (privacy policy, terms): dark hero + light body. */
export function LegalPage({
  title,
  accent,
  updated,
  intro,
  children,
}: {
  title: string;
  accent: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-white text-ink">
      <header className="section-x relative isolate overflow-hidden bg-black pt-36 pb-14 text-white md:pt-44 md:pb-18">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_70%_at_50%_0%,rgb(123_79_255/0.4),transparent_70%)]"
        />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>
        <h1 className="mt-6 text-[clamp(2.25rem,6vw,5rem)] leading-[0.98] font-bold tracking-tight">
          {title}{" "}
          <span className="font-serif font-normal italic">{accent}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          {intro}
        </p>
        <p className="mt-4 text-xs tracking-wide text-white/50 uppercase">
          Last updated: {updated}
        </p>
      </header>

      <div className="section-x max-w-none py-14 md:py-20">
        <div className="max-w-3xl space-y-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight md:[&_h2]:text-2xl [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-neutral-700 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:leading-relaxed [&_ul]:text-neutral-700 [&_a]:font-medium [&_a]:text-violet [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-ink">
          {children}
        </div>
      </div>
    </article>
  );
}
