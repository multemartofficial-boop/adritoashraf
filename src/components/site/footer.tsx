import Link from "next/link";
import type { SiteSettingsRow } from "@/types/database";
import { getPublishedLandingPages, type ProjectCard } from "@/lib/data/public";
import { SOCIAL_LABEL, SocialIcon } from "./social-icon";

const resolve = (href: string) => (href.startsWith("#") ? `/${href}` : href);

export async function Footer({
  settings: s,
  projects,
}: {
  settings: SiteSettingsRow;
  projects: ProjectCard[];
}) {
  const socials = s.social_links.filter((l) => l.url);
  const giftPages = await getPublishedLandingPages();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-ink">
      <div className="section-x grid gap-10 pt-20 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Link
            href="/"
            className="inline-block rounded-full border-[1.5px] border-orange px-4 py-1 font-serif text-2xl text-orange italic"
          >
            {s.site_name}
          </Link>
          {s.footer_text && (
            <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
              {s.footer_text}
            </p>
          )}
          {socials.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-orange">Follow me</p>
              <ul className="flex flex-wrap gap-2">
                {socials.map((l) => (
                  <li key={`${l.platform}-${l.url}`}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABEL[l.platform] ?? l.platform}
                      className="bg-orange-pill grid size-9 place-items-center rounded-full text-white transition-transform duration-200 hover:scale-110"
                    >
                      <SocialIcon platform={l.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-sm font-semibold text-orange">
            Quick Links
          </h2>
          <ul className="space-y-2.5 text-sm">
            {s.nav_links.map((l) => (
              <li key={l.href}>
                <a
                  href={resolve(l.href)}
                  className="text-neutral-700 hover:text-ink hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/book"
                className="text-neutral-700 hover:text-ink hover:underline"
              >
                Book a meeting
              </Link>
            </li>
            {giftPages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  className="text-neutral-700 hover:text-ink hover:underline"
                >
                  {p.internal_name || "Free gift"}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/privacy"
                className="text-neutral-700 hover:text-ink hover:underline"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-neutral-700 hover:text-ink hover:underline"
              >
                Terms &amp; conditions
              </Link>
            </li>
          </ul>
        </nav>

        {projects.length > 0 && (
          <nav aria-label="Projects">
            <h2 className="mb-4 text-sm font-semibold text-orange">Projects</h2>
            <ul className="space-y-2.5 text-sm">
              {projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-neutral-700 hover:text-ink hover:underline"
                  >
                    {p.title} {p.title_accent}
                  </Link>
                </li>
              ))}
              {projects.length > 6 && (
                <li>
                  <Link
                    href="/projects"
                    className="font-medium text-orange hover:text-ink hover:underline"
                  >
                    View all projects →
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}

        <div className="space-y-6 text-sm">
          {s.contact_email && (
            <div>
              <h2 className="mb-2 font-semibold text-orange">Email</h2>
              <a
                href={`mailto:${s.contact_email}`}
                className="break-all text-neutral-700 hover:text-ink hover:underline"
              >
                {s.contact_email}
              </a>
            </div>
          )}
          {(s.phone || s.whatsapp) && (
            <div>
              <h2 className="mb-2 font-semibold text-orange">Phone</h2>
              {s.phone && (
                <a
                  href={`tel:${s.phone.replace(/\s/g, "")}`}
                  className="block text-neutral-700 hover:text-ink"
                >
                  {s.phone}
                </a>
              )}
              {s.whatsapp && (
                <a
                  href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-neutral-700 hover:text-ink"
                >
                  WhatsApp: {s.whatsapp}
                </a>
              )}
            </div>
          )}
          {s.address && (
            <div>
              <h2 className="mb-2 font-semibold text-orange">Address</h2>
              <p className="text-neutral-700">{s.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Giant wordmark over a lavender field, cropped at the bottom (reference footer). */}
      <div className="section-x pb-6">
        <div
          aria-hidden
          className="relative flex h-[clamp(140px,21vw,360px)] items-end justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(90%_120%_at_50%_120%,#c7a6ff_0%,#8b5cf6_35%,#3b1d72_75%,#1b0b38_100%)]"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(100deg,rgb(255_255_255/0.06)_0_2px,transparent_2px_18px)]" />
          <span className="relative translate-y-[22%] bg-gradient-to-b from-white via-white/90 to-violet-200/60 bg-clip-text text-[clamp(4.5rem,21vw,22rem)] leading-[0.8] font-extrabold tracking-tighter text-transparent uppercase select-none">
            {s.site_name}
          </span>
        </div>
        <p className="mt-5 text-center text-xs text-neutral-500">
          © {year} {s.owner_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
