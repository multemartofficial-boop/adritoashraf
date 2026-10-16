import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { LpForm } from "../lp-form";

export const metadata: Metadata = { title: "Edit Gift Page" };

export default async function EditLandingPagePage({ params }: PageProps<"/admin/landing-pages/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: page } = await supabase.from("landing_pages").select("*").eq("id", id).maybeSingle();
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={page.internal_name || "Edit Gift Page"}
        description={`/${page.slug} · ${page.view_count} views · ${page.thankyou_count} gifts delivered`}
      />
      <LpForm page={page} />
    </div>
  );
}
