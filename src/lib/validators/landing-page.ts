import { z } from "zod";

const text = (max = 400) => z.string().max(max);
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug needs at least 2 characters.")
  .max(60)
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Lowercase letters, numbers and dashes only.",
  )
  .refine(
    (s) =>
      ![
        "admin",
        "api",
        "book",
        "projects",
        "webinar",
        "privacy",
        "terms",
        "manage-booking",
        "sitemap.xml",
        "robots.txt",
      ].includes(s),
    "That slug is reserved by the site.",
  );

const httpUrl = z.union([
  z.literal(""),
  z.url({
    protocol: /^https?$/,
    error: "Enter a full URL starting with https://",
  }),
]);
const imageUrl = z.union([
  z.literal(""),
  z.url({ protocol: /^https$/, error: "Image must be an https URL." }),
  z.string().regex(/^\/[\w\-./]+$/, "Invalid image path."),
]);

const fd = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");
const parseJsonList = (raw: string): string[] => {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v)
      ? v.map((x) => String(x).trim()).filter(Boolean)
      : [];
  } catch {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

export const landingPageSchema = z.object({
  internal_name: text(120).min(1, "Give the page an internal name."),
  slug: slugSchema,
  status: z.enum(["draft", "published"]),
  pill_text: text(60),
  heading: z.object({
    accent: text(120),
    strong: text(160),
    muted: text(160),
  }),
  subheadline: text(300),
  bullets: z.array(text(200)).max(6, "Keep it to 6 bullet points.").default([]),
  audience_line: text(300),
  cover_image: imageUrl,
  cover_tag: text(40),
  cta_label: text(80),
  privacy_line: text(120),
  form_embed: text(2000),
  gift_type: z.enum(["pdf", "link", "video"]),
  gift_file: text(400),
  gift_url: httpUrl,
  thank_you_title: text(160),
  thank_you_text: text(400),
  next_step_label: text(80),
  next_step_href: text(400),
  seo_title: text(70),
  seo_description: text(160),
  og_image: imageUrl,
});

export type LandingPageInput = z.infer<typeof landingPageSchema>;

export function landingPageFromFormData(fd0: FormData): LandingPageInput {
  return {
    internal_name: fd(fd0, "internal_name").trim(),
    slug: fd(fd0, "slug").trim().toLowerCase(),
    status: fd(fd0, "status") === "published" ? "published" : "draft",
    pill_text: fd(fd0, "pill_text").trim(),
    heading: {
      accent: fd(fd0, "heading_accent").trim(),
      strong: fd(fd0, "heading_strong").trim(),
      muted: fd(fd0, "heading_muted").trim(),
    },
    subheadline: fd(fd0, "subheadline").trim(),
    bullets: parseJsonList(fd(fd0, "bullets")),
    audience_line: fd(fd0, "audience_line").trim(),
    cover_image: fd(fd0, "cover_image").trim(),
    cover_tag: fd(fd0, "cover_tag").trim(),
    cta_label: fd(fd0, "cta_label").trim(),
    privacy_line: fd(fd0, "privacy_line").trim(),
    form_embed: fd(fd0, "form_embed").trim(),
    gift_type: (["pdf", "link", "video"].includes(fd(fd0, "gift_type"))
      ? fd(fd0, "gift_type")
      : "pdf") as LandingPageInput["gift_type"],
    gift_file: fd(fd0, "gift_file").trim(),
    gift_url: fd(fd0, "gift_url").trim(),
    thank_you_title: fd(fd0, "thank_you_title").trim(),
    thank_you_text: fd(fd0, "thank_you_text").trim(),
    next_step_label: fd(fd0, "next_step_label").trim(),
    next_step_href: fd(fd0, "next_step_href").trim(),
    seo_title: fd(fd0, "seo_title").trim(),
    seo_description: fd(fd0, "seo_description").trim(),
    og_image: fd(fd0, "og_image").trim(),
  };
}
