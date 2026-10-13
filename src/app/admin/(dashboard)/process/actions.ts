"use server";

import { revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { idSchema, parseFaqForm, parseProcessStepForm } from "@/lib/validators/content";

// Shared by "How I Work" steps and FAQs (both are small ordered lists).

export async function saveProcessStepAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseProcessStepForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    if (id) {
      const { error } = await supabase.from("process_steps").update(parsed.data).eq("id", idSchema.parse(id));
      if (error) return { error: "Could not save the step." };
    } else {
      const { data: last } = await supabase
        .from("process_steps")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await supabase.from("process_steps").insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) return { error: "Could not add the step." };
    }
    revalidatePublic("/admin/process");
    return { success: id ? "Step saved." : "Step added.", savedAt: Date.now() };
  });
}

export async function saveFaqAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseFaqForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    if (id) {
      const { error } = await supabase.from("faqs").update(parsed.data).eq("id", idSchema.parse(id));
      if (error) return { error: "Could not save the question." };
    } else {
      const { data: last } = await supabase
        .from("faqs")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await supabase.from("faqs").insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) return { error: "Could not add the question." };
    }
    revalidatePublic("/admin/faqs");
    return { success: id ? "Question saved." : "Question added.", savedAt: Date.now() };
  });
}
