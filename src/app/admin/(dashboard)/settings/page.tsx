import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader title="Site Settings" description="All text in the header, hero, about section, footer and search results." />
      {settings ? (
        <SettingsForm key={settings.updated_at} settings={settings} />
      ) : (
        <p className="text-sm text-admin-danger">Site settings row is missing. Re-run supabase/schema.sql.</p>
      )}
    </div>
  );
}
