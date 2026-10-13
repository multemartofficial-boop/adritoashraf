import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveServiceAction } from "../actions";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "New service" };

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="New service" />
      <ServiceForm action={saveServiceAction.bind(null, null)} />
    </div>
  );
}
