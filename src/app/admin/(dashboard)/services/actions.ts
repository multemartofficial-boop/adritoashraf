"use server";

import { redirect } from "next/navigation";
import { isUniqueViolation, revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { idSchema, parseServiceForm } from "@/lib/validators/content";

const SLUG_TAKEN = { fieldErrors: { slug: "Another service already uses this slug." } };

export async function saveServiceAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseServiceForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    if (!id) {
      const { data: last } = await supabase
        .from("services")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await supabase.from("services").insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 });
      if (isUniqueViolation(error)) return SLUG_TAKEN;
      if (error) return { error: "Could not create the service." };
      revalidatePublic("/admin/services");
      redirect("/admin/services");
    }

    const serviceId = idSchema.parse(id);
    const { error } = await supabase.from("services").update(parsed.data).eq("id", serviceId);
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    if (error) return { error: "Could not save the service." };
    revalidatePublic("/admin/services", `/admin/services/${serviceId}`);
    return { success: "Service saved.", savedAt: Date.now() };
  });
}
