import type { Metadata } from "next";
import { CalendarCheck, Inbox, UserPen, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { StatsRow } from "@/components/admin/stats-row";
import { ContactsManager } from "./contacts-manager";

export const metadata: Metadata = { title: "Contacts" };

const SOURCES = ["form", "manual", "booking"] as const;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function ContactsPage({ searchParams }: PageProps<"/admin/contacts">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const source = SOURCES.find((s) => s === str(sp.source)) ?? "";
  const q = str(sp.q).trim().slice(0, 80);

  let query = supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(500);
  if (source) query = query.eq("source", source);
  if (q) {
    const safe = q.replace(/[%_,()]/g, " ");
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const [{ data: contacts }, { count: total }, { count: fromForm }, { count: fromBooking }, { data: pages }] = await Promise.all([
    query,
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("source", "form"),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("source", "booking"),
    supabase.from("landing_pages").select("id, internal_name"),
  ]);
  const pageNames = new Map((pages ?? []).map((p) => [p.id, p.internal_name]));
  const items = (contacts ?? []).map((c) => ({
    ...c,
    page_name: (c.page_id && pageNames.get(c.page_id)) || c.page_slug,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Leads from gift-page forms and meeting bookings, plus anyone you add by hand. The badge shows where each contact came from."
      />
      <StatsRow
        stats={[
          { label: "All contacts", hint: "Every contact in the list.", value: String(total ?? 0), icon: Users, tone: "info" },
          { label: "From forms", hint: "Signed up through a gift-page form.", value: String(fromForm ?? 0), icon: Inbox, tone: "success" },
          { label: "From bookings", hint: "Booked a meeting through the site.", value: String(fromBooking ?? 0), icon: CalendarCheck, tone: "info" },
          { label: "Added manually", hint: "Entered by you from this page.", value: String((total ?? 0) - (fromForm ?? 0) - (fromBooking ?? 0)), icon: UserPen, tone: "warning" },
        ]}
      />
      <ContactsManager items={items} filters={{ source, q }} />
    </div>
  );
}
