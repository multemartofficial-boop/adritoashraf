import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { RedirectsManager } from "./redirects-manager";

export const metadata: Metadata = { title: "Redirects" };

export default async function RedirectsPage() {
  const { supabase } = await requireAdmin();
  const { data: redirects } = await supabase.from("redirects").select("id, from_path, to_path, is_active").order("from_path");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Redirects"
        description="Permanent 301 redirects. Use them when a page moves or an old link needs a new home. Changes go live within a minute."
      />
      <RedirectsManager redirects={redirects ?? []} />
    </div>
  );
}
