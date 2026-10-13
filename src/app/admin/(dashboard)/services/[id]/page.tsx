import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { saveServiceAction } from "../actions";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit “${service.title}”`} />
      <ServiceForm
        key={service.updated_at}
        action={saveServiceAction.bind(null, service.id)}
        service={{ ...service, price_usd: Number(service.price_usd), price_bdt: Number(service.price_bdt) }}
      />
    </div>
  );
}
