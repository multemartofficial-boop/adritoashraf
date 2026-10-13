import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveTestimonialAction } from "../actions";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: testimonial } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!testimonial) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit testimonial from ${testimonial.client_name}`} />
      <TestimonialForm key={testimonial.updated_at} action={saveTestimonialAction.bind(null, testimonial.id)} testimonial={testimonial} />
    </div>
  );
}
