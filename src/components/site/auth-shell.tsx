import Link from "next/link";

/** Minimal centred layout for the member auth pages (login, signup, reset). */
export function AuthShell({
  title,
  accent,
  subtitle,
  siteName,
  children,
  footer,
}: {
  title: string;
  accent: string;
  subtitle?: string;
  siteName: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-clip bg-black text-white">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(70%_60%_at_50%_0%,rgb(123_79_255/0.45),transparent_70%)]"
      />
      <header className="section-x flex items-center justify-between pt-5 md:pt-6">
        <Link
          href="/"
          className="grid size-11 place-items-center overflow-hidden rounded-full border border-violet/70 bg-ink/50 shadow-glow-violet backdrop-blur-md transition-transform duration-300 hover:scale-105"
          aria-label={`${siteName} home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt={siteName}
            className="size-full object-cover"
          />
        </Link>
        <Link
          href="/"
          className="glass rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          Back to site
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <h1 className="text-center text-[clamp(2rem,6vw,3rem)] leading-[1.02] font-bold tracking-tight">
            {title}{" "}
            <span className="font-serif font-normal italic">{accent}</span>
          </h1>
          {subtitle && (
            <p className="mt-3 text-center text-sm text-white/60">{subtitle}</p>
          )}
          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white p-6 text-ink shadow-2xl md:p-8">
            {children}
          </div>
          {footer && (
            <div className="mt-5 text-center text-sm text-white/60">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
