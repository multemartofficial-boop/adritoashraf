import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Link2Off } from "lucide-react";
import { lookupManageableBooking } from "@/lib/booking/manage";
import { getSiteSettings } from "@/lib/data/public";
import { ManageBooking } from "@/components/booking/manage-booking";

export const metadata: Metadata = { title: "Manage your booking", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ManageBookingPage({ searchParams }: PageProps<"/manage-booking">) {
  const { token } = await searchParams;
  const raw = typeof token === "string" ? token : "";
  const [settings, { booking, cancelNoticeHours, canChange }] = await Promise.all([getSiteSettings(), lookupManageableBooking(raw)]);

  return (
    <section className="section-x flex min-h-svh flex-col items-center justify-center bg-[#f6f5fb] pt-32 pb-24 text-ink">
      {!booking ? (
        <div className="max-w-md text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-neutral-200 text-neutral-600">
            <Link2Off className="size-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold">This booking link is invalid</h1>
          <p className="mt-3 text-neutral-600">
            The link may have expired or been replaced by a newer email. Please use the most recent email about your booking
            {settings.contact_email && (
              <>
                , or contact <a href={`mailto:${settings.contact_email}`} className="text-violet underline">{settings.contact_email}</a>
              </>
            )}
            .
          </p>
          <Link href="/book" className="bg-cta mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
            Book a new meeting
          </Link>
        </div>
      ) : (
        <ManageBooking
          token={raw}
          booking={booking}
          cancelNoticeHours={cancelNoticeHours}
          canChange={canChange}
          ownerName={settings.owner_name}
          contactEmail={settings.contact_email}
        />
      )}
      <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back home
      </Link>
    </section>
  );
}
