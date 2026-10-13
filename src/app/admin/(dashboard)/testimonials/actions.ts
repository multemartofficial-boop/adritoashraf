"use server";

import { redirect } from "next/navigation";
import { revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { removePublicFilesByUrl } from "@/lib/storage";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { idSchema, parseTestimonialForm } from "@/lib/validators/content";

export async function saveTestimonialAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseTestimonialForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    const data = parsed.data;

    if (!id) {
      const { data: last } = await supabase
        .from("testimonials")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await supabase.from("testimonials").insert({ ...data, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) return { error: "Could not create the testimonial." };
      revalidatePublic("/admin/testimonials");
      redirect("/admin/testimonials");
    }

    const tid = idSchema.parse(id);
    const { data: before } = await supabase.from("testimonials").select("avatar_url, poster_url").eq("id", tid).maybeSingle();
    const { error } = await supabase.from("testimonials").update(data).eq("id", tid);
    if (error) return { error: "Could not save the testimonial." };
    if (before) {
      await removePublicFilesByUrl(
        [before.avatar_url, before.poster_url].filter((u) => u && u !== data.avatar_url && u !== data.poster_url),
      );
    }
    revalidatePublic("/admin/testimonials", `/admin/testimonials/${tid}`);
    return { success: "Testimonial saved.", savedAt: Date.now() };
  });
}
