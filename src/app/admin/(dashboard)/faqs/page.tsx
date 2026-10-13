import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { FaqManager } from "./faq-manager";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("faqs").select("id, question, answer, is_published").order("sort_order");
  return (
    <div className="space-y-6">
      <PageHeader title="FAQs" description="Shown as an accordion in the last section before the footer." />
      <FaqManager initial={data ?? []} />
    </div>
  );
}
