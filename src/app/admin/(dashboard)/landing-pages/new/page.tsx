import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { LpForm } from "../lp-form";

export const metadata: Metadata = { title: "New Gift Page" };

export default async function NewLandingPagePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Gift Page"
        description="Prefilled with the 7-Step Checklist template — edit anything, upload the gift file, then publish."
      />
      <LpForm />
    </div>
  );
}
