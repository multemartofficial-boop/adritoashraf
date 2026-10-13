import type { AboutMeRow, SiteSettingsRow } from "@/types/database";

/**
 * Fallback site text, used only if the database is unreachable. The real values live in
 * Supabase (site_settings) and are edited from /admin/settings.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettingsRow = {
  id: 1,
  site_name: "Adrito",
  owner_name: "Adrito Ashraf",
  role: "Full Stack Developer",
  tagline: "Building websites, web apps and business software with a modern AI-assisted workflow — faster delivery, clean code, real results.",
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
  seo_focus_keyword: "",
  og_image: "",
  ga4_id: "",
  search_console_verification: "",
  about_quote: "",
  about_quote_author: "",
  default_currency: "USD",
  section_texts: {},
  theme: {},
  updated_at: new Date(0).toISOString(),
};

/** Fallback for the About Me section if the database is unreachable. */
export const DEFAULT_ABOUT_ME: AboutMeRow = {
  id: 1,
  is_visible: false, // hidden on fallback — the DB row decides
  tag: "About Me",
  heading: { accent: "Hi, I'm Adrito,", strong: "A Full Stack Developer", muted: "Who Builds Real Products." },
  bio_1: "I'm Adrito, a full stack developer who builds websites, SaaS products and business software for real businesses. I work with a modern AI-assisted workflow: I plan the architecture, direct AI tools, review and test every piece, and ship production-ready systems.",
  bio_2: "This lets me deliver in weeks what usually takes months, without cutting corners on quality. Every project comes with full source code, clear handover, and support after launch.",
  full_name: "Adrito Ashraf",
  role: "Full Stack Developer",
  location: "Dhaka, Bangladesh",
  experience_years: "4+",
  email: "",
  availability_enabled: true,
  availability_text: "Available for projects",
  experience_badge: "4+ Years Experience",
  skills: [],
  social_links: [],
  primary_cta_label: "Let's Talk",
  primary_cta_href: "/book",
  cv_url: "",
  image_url: "/uploads/profile.webp",
  updated_at: new Date(0).toISOString(),
};

export const HERO_IMAGE = { desktop: "/images/hero-bg.webp", mobile: "/images/hero-bg-mobile.webp" };
