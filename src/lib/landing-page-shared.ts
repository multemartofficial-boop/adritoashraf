import type { LandingPageInput } from "@/lib/validators/landing-page";
import type { GiftType } from "@/types/database";

export const GIFT_LABELS: Record<GiftType, string> = {
  pdf: "Download PDF",
  video: "Watch tutorial",
  link: "Open resource",
};

/** Ready-made defaults for the "New page" form (the 7-Step Checklist gift). */
export const LP_TEMPLATE: LandingPageInput = {
  internal_name: "7-Step Checklist — Manual Work to Software",
  slug: "free-guide",
  status: "draft",
  pill_text: "Free Gift",
  heading: {
    accent: "Stop running your business on phone calls and guesswork.",
    strong: "7-Step Checklist:",
    muted: "move from manual work to real software, the right way.",
  },
  subheadline:
    "The exact checklist I use with clients before building their custom system — so you skip the costly mistakes most businesses make on their first software project.",
  bullets: [
    "The 7 decisions to make before you write a single line of spec",
    "How to know if you're ready for custom software (2-minute test)",
    "Which manual tasks to automate first — and what to leave alone",
    "The questions to ask any developer before you pay them",
    "A simple template for documenting your current workflow",
  ],
  audience_line:
    "For business owners losing hours to version conflicts, phone-call stock checks and day-long reports — but aren't sure if they need real software yet.",
  cover_image: "",
  cover_tag: "100% Free",
  cta_label: "Send me the free checklist",
  privacy_line: "No spam. Unsubscribe anytime.",
  form_embed: "",
  gift_type: "pdf",
  gift_file: "",
  gift_url: "",
  thank_you_title: "You're all set!",
  thank_you_text:
    "Your checklist is ready — grab it below and start mapping your move away from manual work.",
  next_step_label: "Book a free 15-minute call",
  next_step_href: "/book",
  seo_title: "Free Checklist: Move Your Business From Manual Work to Software",
  seo_description:
    "A free 7-step checklist for business owners ready to trade manual work for real software. Download instantly.",
  og_image: "",
};
