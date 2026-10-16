"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, Pencil, Trash2, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { deleteWebinarAction, setWebinarStatusAction } from "./actions";
import { WEBINAR_TZ } from "@/lib/webinar-shared";
import { fmtShortDate, fmtTime } from "@/lib/booking/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/admin/empty-state";
import { FitImage } from "@/components/ui/fit-image";
import type { WebinarRow } from "@/types/database";

export function WebinarsList({ webinars, accessCounts }: { webinars: WebinarRow[]; accessCounts: Map<string, number> }) {
  const [items, setItems] = useState(webinars);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="No webinars yet"
        description="Create your first webinar, then grant access to members by email."
        action={
          <Button asChild size="sm">
            <Link href="/admin/webinars/new">New webinar</Link>
          </Button>
        }
      />
    );
  }

  const toggle = (w: WebinarRow, published: boolean) => {
    const prev = items;
    setItems(items.map((i) => (i.id === w.id ? { ...i, status: published ? "published" : "draft" } : i)));
    startTransition(async () => {
      const res = await setWebinarStatusAction(w.id, published);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Could not update.");
      } else toast.success(published ? "Published" : "Unpublished");
    });
  };

  const remove = async (w: WebinarRow) => {
    if (!confirm(`Delete "${w.title}"? Members will lose access and resources are removed.`)) return;
    setBusyId(w.id);
    const res = await deleteWebinarAction(w.id);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error ?? "Could not delete.");
    setItems((cur) => cur.filter((i) => i.id !== w.id));
    toast.success("Webinar deleted");
  };

  return (
    <ul className="divide-y divide-admin-border">
      {items.map((w) => {
        const published = w.status === "published";
        const count = accessCounts.get(w.id) ?? 0;
        return (
          <li key={w.id} className="flex items-center gap-4 px-5 py-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-violet/10">
              {w.thumbnail_url ? (
                <FitImage src={w.thumbnail_url} alt={w.title} sizes="56px" />
              ) : (
                <span className="grid size-full place-items-center text-admin-muted">
                  <Video className="size-5" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/webinars/${w.id}`} className="block truncate text-sm font-semibold hover:underline">
                {w.title}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-admin-muted">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {w.start_at ? `${fmtShortDate(w.start_at, WEBINAR_TZ)} · ${fmtTime(w.start_at, WEBINAR_TZ)}` : "No date set"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" /> {count} with access
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge tone={published ? "success" : "neutral"} dot>
                {published ? "Published" : "Draft"}
              </Badge>
              <div className="hidden items-center gap-1.5 sm:flex">
                <Switch
                  checked={published}
                  onCheckedChange={(v) => toggle(w, v)}
                  aria-label={`Publish ${w.title}`}
                />
              </div>
              <Button variant="outline" size="icon-sm" asChild>
                <Link href={`/admin/webinars/${w.id}`} aria-label={`Edit ${w.title}`}>
                  <Pencil />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => remove(w)}
                disabled={busyId === w.id}
                aria-label={`Delete ${w.title}`}
                className="text-admin-danger hover:bg-rose-50"
              >
                {busyId === w.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
