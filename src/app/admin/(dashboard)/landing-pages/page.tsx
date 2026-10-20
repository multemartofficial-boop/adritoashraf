import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { LpList, type LpListItem } from "./lp-list";

export const metadata: Metadata = { title: "Gift Pages" };

export default async function LandingPagesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: pages }, { data: events }] = await Promise.all([
    supabase.from("landing_pages").select("*").order("created_at", { ascending: false }),
    supabase
      .from("landing_page_events")
      .select("page_id, utm_source")
      .neq("utm_source", "")
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  // Top campaign source per page (from the most recent attributed events).
  const topSource: Record<string, string> = {};
  const counts = new Map<string, Map<string, number>>();
  for (const e of events ?? []) {
    const m = counts.get(e.page_id) ?? new Map<string, number>();
    m.set(e.utm_source, (m.get(e.utm_source) ?? 0) + 1);
    counts.set(e.page_id, m);
  }
  for (const [pageId, m] of counts) {
    topSource[pageId] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  }

  const items: LpListItem[] = (pages ?? []).map((p) => ({
    id: p.id,
    internal_name: p.internal_name,
    slug: p.slug,
    status: p.status,
    gift_type: p.gift_type,
    view_count: p.view_count,
    thankyou_count: p.thankyou_count,
    top_source: topSource[p.id] ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gift Pages"
        description="Free-gift landing pages (lead magnets). Each one captures leads with its built-in signup form (see Contacts) and delivers the gift on its thank-you page."
        actions={
          <Button asChild>
            <Link href="/admin/landing-pages/new">
              <Plus /> New Gift Page
            </Link>
          </Button>
        }
      />
      <LpList initial={items} />
    </div>
  );
}
