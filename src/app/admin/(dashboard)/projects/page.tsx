import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsList } from "./projects-list";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, title_accent, slug, short_description, tags, cover_image, card_theme, is_published")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Your portfolio. Order here is the order on the site. Toggle the switch to publish or hide."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus /> New Project
            </Link>
          </Button>
        }
      />
      <ProjectsList initial={projects ?? []} />
    </div>
  );
}
