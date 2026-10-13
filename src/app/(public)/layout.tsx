import type { Metadata } from "next";
import { getProjects, getSiteSettings } from "@/lib/data/public";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seo_title || `${s.owner_name} — ${s.role}`;
  const description = s.seo_description || s.tagline;
  return {
    title: { default: title, template: `%s · ${s.owner_name}` },
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: s.owner_name,
      images: s.og_image ? [{ url: s.og_image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: s.og_image ? [s.og_image] : undefined },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header
        siteName={settings.site_name}
        links={settings.nav_links}
        cta={{ label: settings.header_cta_label, href: settings.header_cta_href }}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} projects={projects} />
    </>
  );
}
