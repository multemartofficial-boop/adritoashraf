import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { UsersManager } from "./users-manager";
import type { ProfileRow, WebinarAccessRow, WebinarRow } from "@/types/database";

export const metadata: Metadata = { title: "Members" };

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();

  const [{ data: profiles }, { data: access }, { data: webinars }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(2000),
    supabase.from("webinar_access").select("*"),
    supabase.from("webinars").select("id, title, slug, status").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Everyone who created an account, and which webinars each member can watch."
      />
      <Panel>
        <UsersManager
          profiles={(profiles ?? []) as ProfileRow[]}
          access={(access ?? []) as WebinarAccessRow[]}
          webinars={(webinars ?? []) as Pick<WebinarRow, "id" | "title" | "status">[]}
        />
      </Panel>
    </div>
  );
}
