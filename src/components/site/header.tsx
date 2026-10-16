"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  Circle,
  FolderKanban,
  HelpCircle,
  Home,
  ListOrdered,
  Mail,
  MessageSquareQuote,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/database";

const NAV_ICONS: Record<string, LucideIcon> = {
  "#home": Home,
  "#about": UserRound,
  "#portfolio": FolderKanban,
  "#projects": FolderKanban,
  "#services": Briefcase,
  "#process": ListOrdered,
  "#testimonials": MessageSquareQuote,
  "#faqs": HelpCircle,
  "#faq": HelpCircle,
  "#contact": Mail,
  "#book": Mail,
};

const navIcon = (href: string): LucideIcon => NAV_ICONS[href] ?? Circle;

/** Thin divider that separates the three pill groups. */
const Divider = () => (
  <span aria-hidden className="h-6 w-px shrink-0 bg-white/10" />
);

export default function Header({
  logo,
  siteName,
  nav,
  cta,
}: {
  logo: string;
  siteName: string;
  nav: NavLink[];
  cta: NavLink;
}) {
  const [active, setActive] = useState<string>(nav[0]?.href ?? "");
  const pathname = usePathname();
  const onHome = pathname === "/";

  // Active-section highlighting on the home page.
  useEffect(() => {
    if (!onHome) return;
    const links = nav.filter((l) => l.href.startsWith("#"));
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => !!el);
    const onScroll = () => {
      let current = "";
      for (const el of sections)
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.35)
          current = `#${el.id}`;
      setActive(current);
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [nav, onHome]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 md:pt-5">
      {/* Floating pill — three groups separated by faint dividers */}
      <nav
        aria-label="Main"
        className="flex h-16 max-w-full items-center gap-4 rounded-full border border-violet/40 bg-[#0B0B14]/90 px-3 shadow-[0_12px_40px_rgb(0_0_0/0.55),0_0_28px_rgb(124_77_255/0.22)] backdrop-blur-xl sm:gap-8"
      >
        {/* LEFT — brand orb */}
        <Link
          href="/"
          aria-label={`${siteName} home`}
          title={siteName}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1A1A24] ring-1 ring-violet/45 transition-all duration-300 hover:ring-violet"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" className="size-7 rounded-full object-cover" />
        </Link>

        <Divider />

        {/* CENTER — icon + label items (icons only on mobile) */}
        <ul className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((l) => {
            const Icon = navIcon(l.href);
            const isActive = onHome && l.href === active;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-label={l.label}
                  title={l.label}
                  onClick={() => setActive(l.href)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-[#A1A1B5] transition-all duration-200 hover:bg-white/[0.06] hover:text-white",
                    isActive && "bg-[#26262F] text-white",
                  )}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={1.5} />
                  <span className="hidden whitespace-nowrap md:inline">
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Divider />

        {/* RIGHT — dominant CTA */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={cta.href}
            className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7C4DFF,#F78FD0)] px-5 text-sm font-bold whitespace-nowrap text-white transition-all duration-300 hover:shadow-[0_0_24px_rgb(124_77_255/0.55)]"
          >
            {cta.label}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
