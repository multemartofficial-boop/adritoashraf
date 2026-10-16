"use server";

import { redirect } from "next/navigation";
import { revalidatePublic, runAdmin, runAdminForm, isUniqueViolation } from "@/lib/admin/run";
import { landingPageSchema, landingPageFromFormData } from "@/lib/validators/landing-page";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { storage, publicPathFromUrl, removePublicFilesByUrl } from "@/lib/storage";

const SLUG_TAKEN = { fieldErrors: { slug: "That slug is already used by another page." } };

export async function saveLandingPageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = landingPageSchema.safeParse(landingPageFromFormData(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
  const id = String(formData.get("id") ?? "");
  const isNew = !id;
  const d = parsed.data;

  const row = {
    type: "free_gift" as const,
    internal_name: d.internal_name,
    slug: d.slug,
    status: d.status,
    pill_text: d.pill_text,
    heading: d.heading,
    subheadline: d.subheadline,
    bullets: d.bullets,
    audience_line: d.audience_line,
    cover_image: d.cover_image,
    cover_tag: d.cover_tag,
    cta_label: d.cta_label,
    privacy_line: d.privacy_line,
    form_embed: d.form_embed,
    gift_type: d.gift_type,
    gift_file: d.gift_file,
    gift_url: d.gift_url,
    thank_you_title: d.thank_you_title,
    thank_you_text: d.thank_you_text,
    next_step_label: d.next_step_label,
    next_step_href: d.next_step_href,
    seo_title: d.seo_title,
    seo_description: d.seo_description,
    og_image: d.og_image,
  };

  return runAdminForm(async ({ supabase }) => {
    if (isNew) {
      const { data: created, error } = await supabase.from("landing_pages").insert(row).select("id").single();
      if (isUniqueViolation(error)) return SLUG_TAKEN;
      if (error || !created) return { error: "Could not create the page." };
      revalidatePublic("/admin/landing-pages");
      redirect(`/admin/landing-pages/${created.id}?created=1`);
    }
    const { error } = await supabase.from("landing_pages").update(row).eq("id", id);
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    if (error) return { error: "Could not save the page." };
    revalidatePublic("/admin/landing-pages", `/admin/landing-pages/${id}`);
    return { success: "Page saved.", savedAt: Date.now() };
  });
}

export async function setLandingPageStatusAction(id: string, status: "draft" | "published"): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { error } = await supabase.from("landing_pages").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic("/admin/landing-pages");
    return { ok: true };
  });
}

export async function duplicateLandingPageAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { data: src } = await supabase.from("landing_pages").select("*").eq("id", id).maybeSingle();
    if (!src) return { ok: false, error: "Page not found." };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- rest omits generated fields
    const { id: _id, created_at: _c, updated_at: _u, view_count: _v, thankyou_count: _t, ...rest } = src;
    const { error } = await supabase.from("landing_pages").insert({
      ...rest,
      internal_name: `${src.internal_name} (copy)`,
      slug: `${src.slug}-copy`.slice(0, 60),
      status: "draft" as const,
    });
    if (error) {
      if (isUniqueViolation(error)) return { ok: false, error: "Copy slug already exists — edit the copy first." };
      return { ok: false, error: error.message };
    }
    revalidatePublic("/admin/landing-pages");
    return { ok: true };
  });
}

export async function deleteLandingPageAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { data: page } = await supabase
      .from("landing_pages")
      .select("gift_file, cover_image, og_image")
      .eq("id", id)
      .maybeSingle();
    if (!page) return { ok: false, error: "Page not found." };
    const { error } = await supabase.from("landing_pages").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (page.gift_file) await storage().remove("private", [page.gift_file]).catch(() => {});
    const images = [page.cover_image, page.og_image]
      .map((u) => publicPathFromUrl(u))
      .filter((p): p is string => !!p);
    await removePublicFilesByUrl(images).catch(() => {});
    revalidatePublic("/admin/landing-pages");
    return { ok: true };
  });
}
