import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { AvailabilityForm, BookingSettingsForm } from "./availability-form";

export const metadata: Metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const { supabase } = await requireAdmin();
  const [{ data: rules }, { data: settings }] = await Promise.all([
    supabase.from("availability_rules").select("weekday, start_time, end_time").eq("is_active", true).order("weekday").order("start_time"),
    supabase.from("booking_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="When clients can book you. Times are in your timezone — clients see them in theirs."
      />
      {settings ? (
        <>
          <AvailabilityForm initial={rules ?? []} />
          <BookingSettingsForm key={settings.updated_at} settings={settings} />
        </>
      ) : (
        <p className="text-sm text-admin-danger">Booking settings row is missing. Re-run supabase/schema.sql.</p>
      )}
    </div>
  );
}
