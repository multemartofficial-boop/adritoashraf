"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import type { NavLink } from "@/types/database";
import { cn } from "@/lib/utils";

type Props = { siteName: string; links: NavLink[]; cta: { label: string; href: string } };

/** On sub-pages, "#about" must point back to the home page section. */
const resolveHref = (href: string, onHome: boolean) => (href.startsWith("#") && !onHome ? `/${href}` : href);

export function Header({ siteName, links, cta }: Props) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState(links[0]?.href ?? "");
  const [open, setOpen] = useState(false);

  // Highlight the nav item whose section occupies the reading line (~45% down the viewport).
  useEffect(() => {
    if (!onHome) return;
    const ids = links.map((l) => l.href).filter((h) => h.startsWith("#")).map((h) => h.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current = `#${els[0].id}`;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = `#${el.id}`;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [links, onHome]);

  // Measure the active link so the highlight pill can slide to it.
  const navRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });
  useEffect(() => {
    if (!onHome) {
      const raf = requestAnimationFrame(() => setPill((p) => (p.visible ? { ...p, visible: false } : p)));
      return () => cancelAnimationFrame(raf);
    }
    const update = () => {
      const el = navRef.current?.querySelector<HTMLElement>(`[data-navkey="${CSS.escape(active)}"]`);
      if (!el) {
        setPill((p) => (p.visible ? { ...p, visible: false } : p));
        return;
      }
      setPill({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    };
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    document.fonts?.ready.then(update).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [active, onHome, links]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="section-x fixed inset-x-0 top-0 z-50 pt-4 md:pt-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="grid size-11 place-items-center overflow-hidden rounded-full border border-violet/70 bg-ink/50 shadow-glow-violet backdrop-blur-md transition-transform duration-300 ease-out hover:scale-105"
          aria-label={`${siteName} home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={siteName} className="size-full object-cover" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul ref={navRef} className="relative flex items-center gap-1 rounded-full border border-violet/40 bg-ink/45 p-1.5 shadow-[0_0_24px_rgb(123_79_255/0.25)] backdrop-blur-xl">
            <span
              aria-hidden
              className={cn(
                "absolute top-1.5 bottom-1.5 rounded-full bg-white/15 transition-[left,width,opacity] duration-300 ease-out",
                !pill.visible && "opacity-0",
              )}
              style={{ left: pill.left, width: pill.width }}
            />
            {links.map((l) => {
              const isActive = onHome && active === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={resolveHref(l.href, onHome)}
                    data-navkey={l.href}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActive(l.href)}
                    className={cn(
                      "relative block rounded-full px-5 py-2 text-sm transition-colors duration-200",
                      isActive ? "text-white" : "text-white/70 hover:text-white",
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={resolveHref(cta.href, onHome)}
            className="bg-cta hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_30px_rgb(123_79_255/0.35)] transition-transform duration-200 hover:scale-[1.03] sm:inline-flex"
          >
            {cta.label}
            <ArrowUpRight className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/50 text-white backdrop-blur-md lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="mt-3 rounded-3xl border border-white/15 bg-ink/90 p-3 text-white shadow-2xl backdrop-blur-xl lg:hidden"
      >
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={resolveHref(l.href, onHome)}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-base text-white/85 hover:bg-white/10"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href={resolveHref(cta.href, onHome)}
          onClick={() => setOpen(false)}
          className="bg-cta mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium"
        >
          {cta.label} <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </header>
  );
}
