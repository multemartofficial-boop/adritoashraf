"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/session";

export async function setQuickSetupDismissed(dismissed: boolean): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdminAction();
  const { error } = await supabase
    .from("dashboard_state")
    .upsert({ key: "quick_setup", value: { dismissed: Boolean(dismissed) } }, { onConflict: "key" });
  if (error) return { ok: false };
  revalidatePath("/admin");
  return { ok: true };
}
