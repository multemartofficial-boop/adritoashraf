// Central place for facts shown on the public site.
// RULE: never invent facts. Anything marked TODO stays hidden in the UI
// until a real value is filled in here. Admin-editable content (services,
// projects, testimonials…) still lives in Supabase; this file only holds
// facts that have no admin editor.

type SiteConfig = {
  name: string;
  siteUrl: string;
  location: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  social: { linkedin: string; facebook: string; github: string; x: string };
  webinar: { enabled: boolean; url: string };
  availability: { slotsText: string };
  resultsCaption: string;
  clientLogos: { src: string; alt: string }[];
  paymentTermsText: string;
  freeSupportDays: number;
  aboutPhoto: string;
  ogImage: string;
  responseTimeHours: number;
  projects: Record<string, { hasImage?: boolean; isDemoData?: boolean }>;
  caseStudyResults: Record<string, { value: string; label: string }[]>;
};

export const site: SiteConfig = {
  name: "Adrito Ashraf",
  siteUrl: "https://adritoashraf.com",
  location: "Dhaka, Bangladesh",

  // --- Contact (all TODO — footer/WhatsApp buttons hide while empty) ---
  email: "", // TODO: public contact email
  phone: "", // TODO: public phone number (international format)
  whatsappNumber: "", // TODO: WhatsApp number, digits only, e.g. "8801XXXXXXXXX"
  whatsappMessage: "হ্যালো, আপনার ওয়েবসাইট দেখে যোগাযোগ করছি।",

  social: {
    linkedin: "", // TODO: LinkedIn profile URL
    facebook: "", // TODO: Facebook page/profile URL
    github: "", // TODO: GitHub profile URL
    x: "", // TODO: X/Twitter profile URL
  },

  // --- Marketing ---
  webinar: {
    enabled: false, // TODO: set a real webinar date/link before enabling
    url: "/webinar",
  },
  availability: {
    slotsText: "", // TODO: e.g. "এই মাসে ২টা নতুন প্রজেক্ট নিচ্ছি" — hidden while empty
  },

  // --- Proof ---
  // Small caption under the "3X faster workflows" stat.
  // TODO: replace with the exact project and comparison ("3X vs the
  // client's previous process on <project>"). Until then the card shows
  // the neutral fallback "Based on client feedback".
  resultsCaption: "",
  clientLogos: [] as { src: string; alt: string }[], // TODO: real client logos under /public

  // --- How I work ---
  // TODO: confirm this wording with real terms before launch.
  paymentTermsText: "Milestone-based payments — you only pay as each stage is delivered",
  freeSupportDays: 0, // TODO: free support period after launch (days); hidden until > 0

  // --- Images ---
  aboutPhoto: "", // TODO: path under /public for a professional photo; falls back to the about_me image
  ogImage: "", // TODO: 1200x630 social share image under /public (e.g. /og.png)

  // Booking form success screen: "I'll get back within X hours."
  responseTimeHours: 24,

  // --- Projects ---
  // Per-project display flags (keyed by project slug).
  //   hasImage: false → the card is hidden from listings until a real
  //     screenshot is uploaded in admin (project #4 currently has none).
  //   isDemoData: true → a small "Demo data" badge on the screenshot.
  //     TODO: confirm which screenshots are mock/demo (some show £ prices
  //     and a different brand than the testimonial company) — swap the
  //     cover image in admin, then clear the flag.
  projects: {
    "cycle-shop-platform": { hasImage: true, isDemoData: false },
    "hr-management-software": { hasImage: true, isDemoData: true },
    "erp-software": { hasImage: true, isDemoData: true },
    "engineering-construction-website": { hasImage: false, isDemoData: false },
  } as Record<string, { hasImage?: boolean; isDemoData?: boolean }>,

  // --- Case study results (TODO: real numbers per project slug) ---
  caseStudyResults: {},
};

/** A project card is shown in listings only when it has a real image. */
export const projectCardVisible = (slug: string): boolean =>
  site.projects[slug]?.hasImage !== false;
