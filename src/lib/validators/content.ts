import { z } from "zod";
import { fdBool, fdJson, fdString } from "@/lib/forms";

// ---------------------------------------------------------------------------
// Shared field rules
// ---------------------------------------------------------------------------
const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);
const required = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `Keep it under ${max} characters.`);

const httpUrl = z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" });
const optionalUrl = z.union([z.literal(""), httpUrl]);

/** Uploaded images are https Supabase URLs; bundled images are site-relative paths. */
const imageUrl = z.union([
  z.literal(""),
  z.url({ protocol: /^https$/, error: "Image must be an https URL." }),
  z.string().regex(/^\/[\w\-./]+$/, "Invalid image path."),
]);

/** Links used in nav/header: /path, #section, https://..., mailto:, tel: */
const link = z
  .string()
  .trim()
  .min(1, "Link is required.")
  .max(300)
  .refine((v) => /^(\/(?!\/)|#)/.test(v) || /^https?:\/\/\S+$/.test(v) || /^(mailto|tel):\S+$/.test(v), {
    message: "Use /page, #section or a full https:// link.",
  });

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single dashes.");

const stringList = (maxItems: number, maxLen: number) =>
  z
    .array(z.string().trim().min(1).max(maxLen, `Each item must be under ${maxLen} characters.`))
    .max(maxItems, `Up to ${maxItems} items.`);

const asArray = (v: unknown) => (Array.isArray(v) ? v : []);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const CARD_THEMES = ["sky", "holo", "aurum", "peach", "violet"] as const;

export const projectSchema = z.object({
  title: required(120, "Title"),
  title_accent: text(60),
  slug: slugSchema,
  short_description: text(300),
  problem: text(3000),
  solution: text(3000),
  features: stringList(20, 200),
  tech_stack: stringList(30, 40),
  tags: stringList(10, 30),
  duration: text(60),
  role: text(80),
  live_url: optionalUrl,
  cover_image: imageUrl,
  card_theme: z.enum(CARD_THEMES),
  seo_title: text(70),
  seo_description: text(170),
  focus_keyword: text(80),
  og_image: imageUrl,
  cover_image_alt: text(140),
  canonical_url: optionalUrl,
  noindex: z.boolean(),
  is_published: z.boolean(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const parseProjectForm = (fd: FormData) =>
  projectSchema.safeParse({
    title: fdString(fd, "title"),
    title_accent: fdString(fd, "title_accent"),
    slug: fdString(fd, "slug"),
    short_description: fdString(fd, "short_description"),
    problem: fdString(fd, "problem"),
    solution: fdString(fd, "solution"),
    features: asArray(fdJson(fd, "features")),
    tech_stack: asArray(fdJson(fd, "tech_stack")),
    tags: asArray(fdJson(fd, "tags")),
    duration: fdString(fd, "duration"),
    role: fdString(fd, "role"),
    live_url: fdString(fd, "live_url").trim(),
    cover_image: fdString(fd, "cover_image"),
    card_theme: fdString(fd, "card_theme") || "sky",
    seo_title: fdString(fd, "seo_title"),
    seo_description: fdString(fd, "seo_description"),
    focus_keyword: fdString(fd, "focus_keyword"),
    og_image: fdString(fd, "og_image"),
    cover_image_alt: fdString(fd, "cover_image_alt"),
    canonical_url: fdString(fd, "canonical_url").trim(),
    noindex: fdBool(fd, "noindex"),
    is_published: fdBool(fd, "is_published"),
  });

export const captionSchema = text(200);

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const SERVICE_ICONS = ["globe", "layers", "building", "code", "smartphone", "shopping-cart", "users", "database"] as const;

const price = z.coerce
  .number({ error: "Enter a number." })
  .min(0, "Price cannot be negative.")
  .max(100_000_000, "Price is too large.")
  .transform((v) => Math.round(v * 100) / 100);

export const serviceSchema = z.object({
  title: required(80, "Title"),
  slug: slugSchema,
  description: text(600),
  includes: stringList(15, 120),
  timeline: text(60),
  price_usd: price,
  price_bdt: price,
  icon: z.enum(SERVICE_ICONS),
  is_published: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const parseServiceForm = (fd: FormData) =>
  serviceSchema.safeParse({
    title: fdString(fd, "title"),
    slug: fdString(fd, "slug"),
    description: fdString(fd, "description"),
    includes: asArray(fdJson(fd, "includes")),
    timeline: fdString(fd, "timeline"),
    price_usd: fdString(fd, "price_usd") || "0",
    price_bdt: fdString(fd, "price_bdt") || "0",
    icon: fdString(fd, "icon") || "code",
    is_published: fdBool(fd, "is_published"),
  });

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export const testimonialSchema = z
  .object({
    type: z.enum(["text", "video"]),
    client_name: required(80, "Client name"),
    client_role: text(120),
    avatar_url: imageUrl,
    content: text(1000),
    rating: z.coerce.number().int().min(1).max(5),
    video_url: optionalUrl,
    poster_url: imageUrl,
    result: text(140),
    company_logo_url: imageUrl,
    link_url: optionalUrl,
    screenshot_url: imageUrl,
    is_published: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "text" && !v.content) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "Review text is required." });
    }
    if (v.type === "video" && !v.video_url) {
      ctx.addIssue({ code: "custom", path: ["video_url"], message: "Video URL is required for video reviews." });
    }
  });
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const parseTestimonialForm = (fd: FormData) =>
  testimonialSchema.safeParse({
    type: fdString(fd, "type") || "text",
    client_name: fdString(fd, "client_name"),
    client_role: fdString(fd, "client_role"),
    avatar_url: fdString(fd, "avatar_url"),
    content: fdString(fd, "content"),
    rating: fdString(fd, "rating") || "5",
    video_url: fdString(fd, "video_url").trim(),
    poster_url: fdString(fd, "poster_url"),
    result: fdString(fd, "result"),
    company_logo_url: fdString(fd, "company_logo_url"),
    link_url: fdString(fd, "link_url").trim(),
    screenshot_url: fdString(fd, "screenshot_url"),
    is_published: fdBool(fd, "is_published"),
  });

// ---------------------------------------------------------------------------
// How I Work steps + FAQs
// ---------------------------------------------------------------------------
export const processStepSchema = z.object({
  title: required(80, "Title"),
  description: text(500),
  is_published: z.boolean(),
});
export const parseProcessStepForm = (fd: FormData) =>
  processStepSchema.safeParse({
    title: fdString(fd, "title"),
    description: fdString(fd, "description"),
    is_published: fdBool(fd, "is_published"),
  });

export const faqSchema = z.object({
  question: required(200, "Question"),
  answer: required(2000, "Answer"),
  is_published: z.boolean(),
});
export const parseFaqForm = (fd: FormData) =>
  faqSchema.safeParse({
    question: fdString(fd, "question"),
    answer: fdString(fd, "answer"),
    is_published: fdBool(fd, "is_published"),
  });

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export const SOCIAL_PLATFORMS = [
  "github",
  "linkedin",
  "facebook",
  "x",
  "instagram",
  "youtube",
  "dribbble",
  "behance",
  "whatsapp",
  "website",
] as const;

export const SECTION_KEYS = ["portfolio", "services", "process", "testimonials", "booking", "faq"] as const;

const sectionTextSchema = z.object({
  tag: text(40),
  accent: text(120),
  strong: text(240),
  muted: text(160),
  description: text(400),
});

export const siteSettingsSchema = z.object({
  site_name: required(40, "Site name"),
  owner_name: required(80, "Your name"),
  role: required(80, "Role"),
  tagline: text(240),
  hero_intro: text(80),
  hero_line_1: required(30, "Hero line 1"),
  hero_line_2: required(30, "Hero line 2"),
  header_cta_label: required(30, "Button label"),
  header_cta_href: link,
  nav_links: z.array(z.object({ label: required(30, "Label"), href: link })).max(8, "Up to 8 links."),
  marquee_items: stringList(20, 40),
  about_heading: z.object({ accent: text(120), strong: text(300), muted: text(200) }),
  about_text: text(600),
  about_quote: text(300),
  about_quote_author: text(80),
  about_stats: z
    .array(z.object({ value: required(12, "Value"), label: required(140, "Label") }))
    .max(3, "Up to 3 stats."),
  contact_email: z.union([z.literal(""), z.email("Enter a valid email.")]),
  phone: text(30),
  whatsapp: text(30),
  address: text(200),
  social_links: z
    .array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), url: optionalUrl }))
    .max(10, "Up to 10 links."),
  footer_text: text(400),
  seo_title: text(70),
  seo_description: text(170),
  seo_focus_keyword: text(80),
  og_image: imageUrl,
  ga4_id: z.string().trim().max(30).regex(/^$|^G-[A-Z0-9]+$/i, "Enter a Measurement ID like G-XXXXXXXXXX."),
  search_console_verification: text(120),
  default_currency: z.enum(["USD", "BDT"]),
  section_texts: z.object(Object.fromEntries(SECTION_KEYS.map((k) => [k, sectionTextSchema])) as Record<
    (typeof SECTION_KEYS)[number],
    typeof sectionTextSchema
  >),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const parseSiteSettingsForm = (fd: FormData) =>
  siteSettingsSchema.safeParse({
    site_name: fdString(fd, "site_name"),
    owner_name: fdString(fd, "owner_name"),
    role: fdString(fd, "role"),
    tagline: fdString(fd, "tagline"),
    hero_intro: fdString(fd, "hero_intro"),
    hero_line_1: fdString(fd, "hero_line_1"),
    hero_line_2: fdString(fd, "hero_line_2"),
    header_cta_label: fdString(fd, "header_cta_label"),
    header_cta_href: fdString(fd, "header_cta_href"),
    nav_links: asArray(fdJson(fd, "nav_links")),
    marquee_items: asArray(fdJson(fd, "marquee_items")),
    about_heading: {
      accent: fdString(fd, "about_heading_accent"),
      strong: fdString(fd, "about_heading_strong"),
      muted: fdString(fd, "about_heading_muted"),
    },
    about_text: fdString(fd, "about_text"),
    about_quote: fdString(fd, "about_quote"),
    about_quote_author: fdString(fd, "about_quote_author"),
    about_stats: asArray(fdJson(fd, "about_stats")),
    contact_email: fdString(fd, "contact_email").trim(),
    phone: fdString(fd, "phone"),
    whatsapp: fdString(fd, "whatsapp"),
    address: fdString(fd, "address"),
    social_links: asArray(fdJson(fd, "social_links")),
    footer_text: fdString(fd, "footer_text"),
    seo_title: fdString(fd, "seo_title"),
    seo_description: fdString(fd, "seo_description"),
    seo_focus_keyword: fdString(fd, "seo_focus_keyword"),
    og_image: fdString(fd, "og_image"),
    ga4_id: fdString(fd, "ga4_id").trim(),
    search_console_verification: fdString(fd, "search_console_verification").trim(),
    default_currency: fdString(fd, "default_currency") || "USD",
    section_texts: Object.fromEntries(
      SECTION_KEYS.map((k) => [
        k,
        {
          tag: fdString(fd, `st_${k}_tag`),
          accent: fdString(fd, `st_${k}_accent`),
          strong: fdString(fd, `st_${k}_strong`),
          muted: fdString(fd, `st_${k}_muted`),
          description: fdString(fd, `st_${k}_description`),
        },
      ]),
    ),
  });

// ---------------------------------------------------------------------------
// About Me section (single row)
// ---------------------------------------------------------------------------
export const aboutMeSchema = z.object({
  is_visible: z.boolean(),
  tag: text(40),
  heading: z.object({ accent: text(120), strong: text(300), muted: text(200) }),
  bio_1: text(600),
  bio_2: text(600),
  full_name: text(80),
  role: text(80),
  location: text(120),
  experience_years: text(20),
  email: z.union([z.literal(""), z.email("Enter a valid email.")]),
  availability_enabled: z.boolean(),
  availability_text: text(80),
  experience_badge: text(60),
  skills: stringList(30, 40),
  social_links: z.array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), url: optionalUrl })).max(10, "Up to 10 links."),
  primary_cta_label: text(40),
  primary_cta_href: link,
  cv_url: z.union([z.literal(""), httpUrl, z.string().regex(/^\/[\w\-./]+$/, "Invalid file path.")]),
  image_url: imageUrl,
});
export type AboutMeInput = z.infer<typeof aboutMeSchema>;

export const parseAboutMeForm = (fd: FormData) =>
  aboutMeSchema.safeParse({
    is_visible: fdBool(fd, "is_visible"),
    tag: fdString(fd, "tag"),
    heading: {
      accent: fdString(fd, "heading_accent"),
      strong: fdString(fd, "heading_strong"),
      muted: fdString(fd, "heading_muted"),
    },
    bio_1: fdString(fd, "bio_1"),
    bio_2: fdString(fd, "bio_2"),
    full_name: fdString(fd, "full_name"),
    role: fdString(fd, "role"),
    location: fdString(fd, "location"),
    experience_years: fdString(fd, "experience_years"),
    email: fdString(fd, "email").trim(),
    availability_enabled: fdBool(fd, "availability_enabled"),
    availability_text: fdString(fd, "availability_text"),
    experience_badge: fdString(fd, "experience_badge"),
    skills: asArray(fdJson(fd, "skills")),
    social_links: asArray(fdJson(fd, "social_links")),
    primary_cta_label: fdString(fd, "primary_cta_label"),
    primary_cta_href: fdString(fd, "primary_cta_href"),
    cv_url: fdString(fd, "cv_url").trim(),
    image_url: fdString(fd, "image_url"),
  });

// ---------------------------------------------------------------------------
// 301 redirects
// ---------------------------------------------------------------------------
export const redirectSchema = z
  .object({
    from_path: z
      .string()
      .trim()
      .min(2, "Enter a path like /old-page.")
      .max(300)
      .regex(/^\/[^?#\s]*$/, "Use a path starting with / (no query string)."),
    to_path: z
      .string()
      .trim()
      .min(1, "Destination is required.")
      .max(500)
      .refine((v) => /^\/\S*$/.test(v) || /^https?:\/\/\S+$/.test(v), {
        message: "Use a /path or a full https:// URL.",
      }),
  })
  .refine((v) => v.from_path !== v.to_path, { path: ["to_path"], message: "Destination can't be the same as the source." });

export const parseRedirectForm = (fd: FormData) =>
  redirectSchema.safeParse({ from_path: fdString(fd, "from_path"), to_path: fdString(fd, "to_path") });

// ---------------------------------------------------------------------------
// Generic list operations
// ---------------------------------------------------------------------------
export const CONTENT_TABLES = ["projects", "services", "testimonials", "process_steps", "faqs"] as const;
export type ContentTable = (typeof CONTENT_TABLES)[number];
export const contentTableSchema = z.enum(CONTENT_TABLES);
export const idSchema = z.uuid();
export const idListSchema = z.array(z.uuid()).min(1).max(500);
