import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { saveProjectAction } from "../actions";
import { ProjectForm } from "../project-form";
import { GalleryManager } from "./gallery-manager";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: project }, { data: images }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit “${project.title}”`}
        description="Changes appear on the public site as soon as you save."
        actions={
          project.is_published && (
            <Button variant="outline" asChild>
              <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View on site
              </a>
            </Button>
          )
        }
      />
      {created === "1" && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> Project created. Add screenshots in the gallery below.
        </p>
      )}
      <ProjectForm key={project.updated_at} action={saveProjectAction.bind(null, project.id)} project={project} />
      <GalleryManager projectId={project.id} initial={images ?? []} />
    </div>
  );
}
