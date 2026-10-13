import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveTestimonialAction } from "../actions";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="New testimonial" />
      <TestimonialForm action={saveTestimonialAction.bind(null, null)} />
    </div>
  );
}
