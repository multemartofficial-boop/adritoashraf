"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  CalendarCheck,
  Circle,
  FolderKanban,
  HelpCircle,
  Home,
  ListOrdered,
  Menu,
  MessageSquareQuote,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/database";
import { MobileNavAuth, NavAuth } from "./nav-auth";

const NAV_ICONS: Record<string, LucideIcon> = {
  "#home": Home,
  "#about": UserRound,
  "#portfolio": FolderKanban,
  "#services": Briefcase,
  "#process": ListOrdered,
  "#testimonials": MessageSquareQuote,
  "#faqs": HelpCircle,
  "#faq": HelpCircle,
  "#book": CalendarCheck,
  "#contact": CalendarCheck,
};

const navIcon = (href: string): LucideIcon => NAV_ICONS[href] ?? Circle;

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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(nav[0]?.href ?? "");
  const pathname = usePathname();
  const onHome = pathname === "/";

  // Collapse the nav items once the user scrolls — the pill shrinks to
  // logo + auth + CTA, per the reference design.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (render-time state adjustment).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

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

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-4 md:pt-5">
      {/* Floating pill: orb + icon nav | divider | auth + CTA (collapses on scroll) */}
      <div className="flex justify-center px-3">
        <div className="flex max-w-full items-center gap-1 rounded-full border border-violet/40 bg-ink/50 p-1.5 shadow-[0_0_24px_rgb(123_79_255/0.25)] backdrop-blur-xl">
          {/* Logo orb — white highlight marks it active on the home section */}
          <Link
            href="/"
            aria-label={`${siteName} home`}
            title={siteName}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full transition-all duration-300 hover:scale-105",
              onHome && !scrolled ? "bg-white/15" : "bg-transparent",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt=""
              className="size-7 rounded-full object-cover shadow-glow-violet"
            />
          </Link>

          {/* Icon navigation — hidden while collapsed/scrolled */}
          <nav
            aria-label="Main"
            className={cn(
              "hidden overflow-hidden transition-all duration-500 ease-out lg:block",
              scrolled ? "max-w-0 opacity-0" : "max-w-96 opacity-100",
            )}
          >
            <ul className="flex items-center gap-0.5">
              {nav.map((l) => {
                const Icon = navIcon(l.href);
                const isActive = onHome && l.href === active;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      title={l.label}
                      aria-label={l.label}
                      onClick={() => setActive(l.href)}
                      className={cn(
                        "grid size-10 place-items-center rounded-full text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white",
                        isActive && "bg-white/15 text-white",
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={1.8} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Divider */}
          <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/15" />

          {/* Auth: quiet "Log in" or avatar dropdown */}
          <NavAuth />

          {/* Dominant action */}
          <Link
            href={cta.href}
            className="bg-cta hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-transform duration-300 hover:scale-105 sm:inline-flex"
          >
            {cta.label}
            <ArrowUpRight className="size-4" />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="section-x pointer-events-none absolute inset-x-0 top-full pt-2 lg:hidden">
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="pointer-events-auto mx-auto w-full max-w-sm rounded-[1.75rem] border border-violet/40 bg-ink/85 p-3 shadow-[0_0_40px_rgb(123_79_255/0.3)] backdrop-blur-xl"
          >
            <ul>
              {nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => {
                      setActive(l.href);
                      setOpen(false);
                    }}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-base text-white/85 hover:bg-white/10",
                      onHome && l.href === active && "bg-white/10 text-white",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li aria-hidden className="mx-4 my-1 h-px bg-white/10" />
              <MobileNavAuth onNavigate={() => setOpen(false)} />
              <li className="pt-2">
                <Link
                  href={cta.href}
                  onClick={() => setOpen(false)}
                  className="bg-cta flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                >
                  {cta.label}
                  <ArrowUpRight className="size-4" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
