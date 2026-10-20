import type { Metadata } from "next";
import { getProjects, getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";
import { Footer } from "@/components/site/footer";
import Header from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { TrackEvents } from "@/components/site/track-events";
import { projectCardVisible, site } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seo_title || `${s.owner_name} — ${s.role}`;
  const description = s.seo_description || s.tagline;
  return {
    title: { default: title, template: `%s · ${s.owner_name}` },
    description,
    keywords: [
      s.seo_focus_keyword,
      s.role,
      "web development",
      "portfolio",
    ].filter(Boolean) as string[],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title,
      description,
      siteName: s.owner_name,
      images:
        s.og_image || site.ogImage
          ? [{ url: s.og_image || site.ogImage, width: 1200, height: 630 }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: s.og_image ? [s.og_image] : undefined,
    },
    verification: s.search_console_verification
      ? { google: s.search_console_verification }
      : undefined,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjects().then((all) => all.filter((p) => projectCardVisible(p.slug))),
  ]);
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  const socials = settings.social_links.filter((l) => l.url).map((l) => l.url);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings.owner_name,
          jobTitle: settings.role,
          url: base,
          image: `${base}/logo.png`,
          email: settings.contact_email || undefined,
          address: settings.address
            ? { "@type": "PostalAddress", addressLocality: settings.address }
            : undefined,
          sameAs: socials.length ? socials : undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: settings.site_name,
          url: base,
          description: settings.seo_description || settings.tagline || undefined,
          founder: { "@type": "Person", name: settings.owner_name },
          areaServed: "Bangladesh",
          address: { "@type": "PostalAddress", addressLocality: site.location },
          email: settings.contact_email || site.email || undefined,
          sameAs: socials.length ? socials : undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name:
            settings.seo_title || `${settings.owner_name} — ${settings.role}`,
          url: base,
          description:
            settings.seo_description || settings.tagline || undefined,
        }}
      />
      {settings.ga4_id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4_id)}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.ga4_id.replace(/'/g, "")}');`,
            }}
          />
        </>
      )}
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header
        logo="/logo.png"
        siteName={settings.site_name}
        nav={settings.nav_links}
        cta={{
          label: settings.header_cta_label,
          href: settings.header_cta_href,
        }}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} projects={projects} />
      <WhatsAppFloat />
      <TrackEvents />
    </>
  );
}
