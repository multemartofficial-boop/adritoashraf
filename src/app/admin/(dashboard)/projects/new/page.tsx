import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveProjectAction } from "../actions";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="New project" description="You can add gallery screenshots after creating the project." />
      <ProjectForm action={saveProjectAction.bind(null, null)} />
    </div>
  );
}
