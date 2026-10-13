import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { ProcessManager } from "./process-manager";

export const metadata: Metadata = { title: "How I Work" };

export default async function ProcessPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("process_steps").select("id, title, description, is_published").order("sort_order");
  return (
    <div className="space-y-6">
      <PageHeader title="How I Work" description="The steps shown in the “How I Work” section. 4 to 5 steps work best." />
      <ProcessManager initial={data ?? []} />
    </div>
  );
}
