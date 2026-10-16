import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { saveWebinarAction } from "../actions";
import { WebinarForm } from "../webinar-form";
import { ResourcesManager } from "./resources-manager";
import { AccessManager } from "./access-manager";
import type { ProfileRow, WebinarAccessRow, WebinarResourceRow, WebinarRow } from "@/types/database";

export const metadata: Metadata = { title: "Edit webinar" };

export default async function EditWebinarPage({ params }: PageProps<"/admin/webinars/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: webinar }, { data: resources }, { data: access }, { data: profiles }] = await Promise.all([
    supabase.from("webinars").select("*").eq("id", id).maybeSingle(),
    supabase.from("webinar_resources").select("*").eq("webinar_id", id).order("sort_order"),
    supabase.from("webinar_access").select("*").eq("webinar_id", id).order("granted_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  if (!webinar) notFound();

  const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p.full_name]));
  const accessRows = ((access ?? []) as WebinarAccessRow[]).map((a) => ({
    ...a,
    name: (a.user_id ? profileById.get(a.user_id) : null) ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={webinar.title}
        description="Edit details, attach resources and manage who can watch."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/webinars">
              <ArrowLeft /> All webinars
            </Link>
          </Button>
        }
      />

      <WebinarForm action={saveWebinarAction.bind(null, webinar.id)} webinar={webinar as WebinarRow} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ResourcesManager webinarId={webinar.id} resources={(resources ?? []) as WebinarResourceRow[]} />
        <AccessManager
          webinarId={webinar.id}
          webinarTitle={webinar.title}
          startAt={webinar.start_at}
          access={accessRows}
          profiles={(profiles ?? []) as ProfileRow[]}
        />
      </div>
    </div>
  );
}
