import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { TestimonialsList } from "./testimonials-list";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("testimonials")
    .select("id, type, client_name, client_role, avatar_url, poster_url, content, rating, is_published")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="The section is hidden on the site until at least one testimonial is published. Text and video cards alternate."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus /> New Testimonial
            </Link>
          </Button>
        }
      />
      <TestimonialsList initial={data ?? []} />
    </div>
  );
}
