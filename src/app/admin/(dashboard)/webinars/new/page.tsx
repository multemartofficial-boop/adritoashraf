import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveWebinarAction } from "../actions";
import { WebinarForm } from "../webinar-form";

export const metadata: Metadata = { title: "New webinar" };

export default async function NewWebinarPage() {
  await requireAdmin();
  const action = saveWebinarAction.bind(null, null);
  return (
    <div className="space-y-6">
      <PageHeader title="New webinar" description="Set the details — grant access on the next screen after creating." />
      <WebinarForm action={action} />
    </div>
  );
}
