import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { requireMember } from "@/lib/auth/session";
import { memberLogoutAction } from "@/lib/auth/member-actions";
import { getSiteSettings } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [member, settings] = await Promise.all([
    requireMember(),
    getSiteSettings(),
  ]);

  return (
    <div className="relative isolate min-h-svh bg-black text-white">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[60vh] bg-[radial-gradient(70%_60%_at_50%_0%,rgb(123_79_255/0.4),transparent_70%)]"
      />

      <header className="section-x flex items-center justify-between gap-3 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-violet/60 bg-ink/50 backdrop-blur-md transition-transform duration-300 hover:scale-105"
            aria-label="Back to site"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={settings.site_name}
              className="size-full object-cover"
            />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">My Webinars</p>
            <p className="truncate text-xs text-white/50">{member.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="glass hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="size-4" /> Back to site
          </Link>
          <form action={memberLogoutAction}>
            <button
              type="submit"
              className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </form>
        </div>
      </header>

      <main className="section-x pb-24">{children}</main>
    </div>
  );
}
