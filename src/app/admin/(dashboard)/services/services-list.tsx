"use client";

import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import type { ServiceRow } from "@/types/database";
import { formatPrice } from "@/lib/money";
import { EmptyState } from "@/components/admin/empty-state";
import { RowControls } from "@/components/admin/list/row-controls";
import { useContentList } from "@/components/admin/list/use-content-list";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/service-icon";

type Item = Pick<ServiceRow, "id" | "title" | "slug" | "timeline" | "price_usd" | "price_bdt" | "icon" | "is_published">;

export function ServicesList({ initial }: { initial: Item[] }) {
  const { items, move, setPublished, remove } = useContentList("services", initial);

  if (items.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          description="Add the services you offer so clients can book a meeting about them."
          action={
            <Button asChild>
              <Link href="/admin/services/new">
                <Plus /> New Service
              </Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel className="divide-y divide-admin-border overflow-hidden">
      {items.map((s, i) => (
        <div key={s.id} className="flex flex-col gap-3 p-3 transition-colors hover:bg-black/[0.015] sm:flex-row sm:items-center sm:p-4">
          <Link href={`/admin/services/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <ServiceIcon name={s.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{s.title}</span>
                {!s.is_published && <Badge>Draft</Badge>}
              </span>
              <span className="block truncate text-xs text-admin-muted">
                From {formatPrice(s.price_usd, "USD")} · {formatPrice(s.price_bdt, "BDT")}
                {s.timeline && ` · ${s.timeline}`}
              </span>
            </span>
          </Link>
          <RowControls
            label={s.title}
            index={i}
            count={items.length}
            published={s.is_published}
            editHref={`/admin/services/${s.id}`}
            onMove={(d) => move(i, d)}
            onPublish={(v) => setPublished(s.id, v)}
            onDelete={() => remove(s.id)}
            deleteDescription="Existing bookings keep their data but will no longer link to this service."
          />
        </div>
      ))}
    </Panel>
  );
}
