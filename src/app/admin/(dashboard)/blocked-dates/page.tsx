import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { BlockedDatesManager } from "./blocked-dates-manager";

export const metadata: Metadata = { title: "Blocked Dates" };

export default async function BlockedDatesPage() {
  const { supabase } = await requireAdmin();
  const { data: dates } = await supabase.from("blocked_dates").select("id, date, reason").order("date");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blocked Dates"
        description="Days off — holidays, travel, personal time. No slots are offered on these dates."
      />
      <BlockedDatesManager dates={dates ?? []} />
    </div>
  );
}
