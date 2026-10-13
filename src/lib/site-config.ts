import type { SiteSettingsRow } from "@/types/database";

/**
 * Fallback site text, used only if the database is unreachable. The real values live in
 * Supabase (site_settings) and are edited from /admin/settings.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettingsRow = {
  id: 1,
  site_name: "Adrito",
  owner_name: "Adrito Ashraf",
  role: "Full Stack Developer",
  tagline: "Building websites, web applications, and business software tailored to specific needs.",
  hero_intro: "Adrito Ashraf",
  hero_line_1: "FULL STACK",
  hero_line_2: "DEVELOPMENT",
  header_cta_label: "Let's Collaborate",
  header_cta_href: "/book",
  nav_links: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Services", href: "#services" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  marquee_items: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "Tailwind CSS"],
  about_heading: { accent: "Build The Idea,", strong: "Ship The Product.", muted: "Real Results For Real Businesses." },
  about_text: "",
  about_stats: [],
  contact_email: "",
  phone: "",
  whatsapp: "",
  address: "Dhaka, Bangladesh",
  social_links: [],
  footer_text: "",
  seo_title: "Adrito Ashraf — Full Stack Developer",
  seo_description: "Freelance full stack developer building websites, SaaS, ERP and HR systems.",
  og_image: "",
  default_currency: "USD",
  section_texts: {},
  theme: {},
  updated_at: new Date(0).toISOString(),
};

export const HERO_IMAGE = { desktop: "/images/hero-bg.webp", mobile: "/images/hero-bg-mobile.webp" };
