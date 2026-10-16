import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { Button } from "@/components/ui/button";
import { WebinarsList } from "./webinars-list";
import type { WebinarAccessRow, WebinarRow } from "@/types/database";

export const metadata: Metadata = { title: "Webinars" };

export default async function AdminWebinarsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: webinars }, { data: access }] = await Promise.all([
    supabase.from("webinars").select("*").order("start_at", { ascending: false, nullsFirst: false }),
    supabase.from("webinar_access").select("webinar_id"),
  ]);

  const counts = new Map<string, number>();
  for (const a of (access ?? []) as Pick<WebinarAccessRow, "webinar_id">[]) {
    counts.set(a.webinar_id, (counts.get(a.webinar_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webinars"
        description="Create webinars, upload replays and grant members access by email."
        actions={
          <Button asChild>
            <Link href="/admin/webinars/new">
              <Plus /> New Webinar
            </Link>
          </Button>
        }
      />
      <Panel>
        <WebinarsList webinars={(webinars ?? []) as WebinarRow[]} accessCounts={counts} />
      </Panel>
    </div>
  );
}
