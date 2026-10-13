import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ServicesList } from "./services-list";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("services")
    .select("id, title, slug, timeline, price_usd, price_bdt, icon, is_published")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="What you offer, with starting prices in USD and BDT. Visitors can switch currency on the site."
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus /> New Service
            </Link>
          </Button>
        }
      />
      <ServicesList initial={(data ?? []).map((s) => ({ ...s, price_usd: Number(s.price_usd), price_bdt: Number(s.price_bdt) }))} />
    </div>
  );
}
