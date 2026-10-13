import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <p className="text-gradient-lavender text-[clamp(6rem,20vw,14rem)] leading-none font-extrabold tracking-tighter">404</p>
      <h1 className="mt-2 text-2xl font-semibold">
        This page <span className="font-serif font-normal italic">does not exist</span>
      </h1>
      <p className="mt-3 max-w-sm text-white/65">The link may be broken or the page may have been removed.</p>
      <Link href="/" className="bg-cta mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
        <ArrowLeft className="size-4" /> Back to home
      </Link>
    </main>
  );
}
