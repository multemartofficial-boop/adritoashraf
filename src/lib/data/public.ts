import "server-only";
import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { DEFAULT_ABOUT_ME, DEFAULT_SITE_SETTINGS } from "@/lib/site-config";
import type {
  AboutMeRow,
  FaqRow,
  ProcessStepRow,
  ProjectImageRow,
  ProjectRow,
  ServiceRow,
  SiteSettingsRow,
  TestimonialRow,
} from "@/types/database";

// Public content readers. RLS guarantees only published rows are returned.
// Failures fall back to safe defaults so a database hiccup never breaks the site.

function logError(scope: string, error: unknown) {
  if (error) console.error(`[public data] ${scope}`, error);
}

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow> => {
  const { data, error } = await supabasePublic().from("site_settings").select("*").eq("id", 1).maybeSingle();
  logError("site_settings", error);
  return data ? { ...DEFAULT_SITE_SETTINGS, ...data } : DEFAULT_SITE_SETTINGS;
});

export const getAboutMe = cache(async (): Promise<AboutMeRow> => {
  const { data, error } = await supabasePublic().from("about_me").select("*").eq("id", 1).maybeSingle();
  logError("about_me", error);
  return data ? { ...DEFAULT_ABOUT_ME, ...data } : DEFAULT_ABOUT_ME;
});

export type ProjectCard = Pick<
  ProjectRow,
  | "id"
  | "title"
  | "title_accent"
  | "slug"
  | "short_description"
  | "tags"
  | "cover_image"
  | "card_theme"
  | "role"
  | "duration"
  | "noindex"
  | "updated_at"
>;

export const getProjects = cache(async (): Promise<ProjectCard[]> => {
  const { data, error } = await supabasePublic()
    .from("projects")
    .select("id, title, title_accent, slug, short_description, tags, cover_image, card_theme, role, duration, noindex, updated_at")
    .eq("is_published", true)
    .order("sort_order");
  logError("projects", error);
  return data ?? [];
});

export const getProjectBySlug = cache(
  async (slug: string): Promise<(ProjectRow & { images: ProjectImageRow[] }) | null> => {
    const { data: project, error } = await supabasePublic()
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    logError("project", error);
    if (!project) return null;
    const { data: images } = await supabasePublic()
      .from("project_images")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order");
    return { ...project, images: images ?? [] };
  },
);

export const getServices = cache(async (): Promise<ServiceRow[]> => {
  const { data, error } = await supabasePublic().from("services").select("*").eq("is_published", true).order("sort_order");
  logError("services", error);
  return (data ?? []).map((s) => ({ ...s, price_usd: Number(s.price_usd), price_bdt: Number(s.price_bdt) }));
});

export const getProcessSteps = cache(async (): Promise<ProcessStepRow[]> => {
  const { data, error } = await supabasePublic().from("process_steps").select("*").eq("is_published", true).order("sort_order");
  logError("process_steps", error);
  return data ?? [];
});

export const getTestimonials = cache(async (): Promise<TestimonialRow[]> => {
  const { data, error } = await supabasePublic().from("testimonials").select("*").eq("is_published", true).order("sort_order");
  logError("testimonials", error);
  return data ?? [];
});

export const getFaqs = cache(async (): Promise<FaqRow[]> => {
  const { data, error } = await supabasePublic().from("faqs").select("*").eq("is_published", true).order("sort_order");
  logError("faqs", error);
  return data ?? [];
});
