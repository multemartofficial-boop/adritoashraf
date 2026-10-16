"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, CopyPlus, ExternalLink, Eye, Gift, PartyPopper, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { deleteLandingPageAction, duplicateLandingPageAction, setLandingPageStatusAction } from "./actions";

export type LpListItem = {
  id: string;
  internal_name: string;
  slug: string;
  status: "draft" | "published";
  gift_type: "pdf" | "link" | "video";
  view_count: number;
  thankyou_count: number;
  top_source: string;
};

export function LpList({ initial }: { initial: LpListItem[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const setStatus = (id: string, status: "draft" | "published") => {
    const prev = items;
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
    startTransition(async () => {
      const res = await setLandingPageStatusAction(id, status);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Could not update.");
      } else toast.success(status === "published" ? "Published" : "Moved to draft");
    });
  };

  const duplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateLandingPageAction(id);
      if (!res.ok) {
        toast.error(res.error ?? "Could not duplicate.");
        return;
      }
      toast.success("Duplicated as a draft");
      router.refresh();
    });
  };

  const remove = async (id: string) => {
    const res = await deleteLandingPageAction(id);
    if (!res.ok) {
      toast.error(res.error ?? "Could not delete.");
      return;
    }
    setItems((cur) => cur.filter((i) => i.id !== id));
    toast.success("Deleted");
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy.");
    }
  };

  if (items.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={Gift}
          title="No gift pages yet"
          description="Create your first free-gift landing page to start collecting leads."
          action={
            <Button asChild>
              <Link href="/admin/landing-pages/new">
                <Plus /> New Gift Page
              </Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel className="divide-y divide-admin-border overflow-hidden">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-3 p-3 transition-colors hover:bg-black/[0.015] sm:flex-row sm:items-center sm:p-4">
          <Link href={`/admin/landing-pages/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Gift className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold">{p.internal_name}</span>
                {p.status === "draft" && <Badge>Draft</Badge>}
                <Badge tone="info">{p.gift_type.toUpperCase()}</Badge>
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-admin-muted">
                <span className="inline-flex items-center gap-1">
                  <ExternalLink className="size-3" /> /{p.slug}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3" /> {p.view_count} views
                </span>
                <span className="inline-flex items-center gap-1">
                  <PartyPopper className="size-3" /> {p.thankyou_count} gifts
                </span>
                {p.top_source && <span className="truncate">top: {p.top_source}</span>}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Tooltip content={p.status === "published" ? "Live on site" : "Draft"}>
              <span className="mr-2 inline-flex">
                <Switch
                  checked={p.status === "published"}
                  onCheckedChange={(v) => setStatus(p.id, v ? "published" : "draft")}
                  aria-label={`Publish ${p.internal_name}`}
                />
              </span>
            </Tooltip>
            <Tooltip content="Copy public link">
              <Button variant="ghost" size="icon-sm" onClick={() => copyLink(p.slug)} aria-label={`Copy link for ${p.internal_name}`}>
                <Copy />
              </Button>
            </Tooltip>
            {p.status === "published" && (
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href={`/${p.slug}`} target="_blank" aria-label={`Open ${p.internal_name}`}>
                  <ExternalLink />
                </Link>
              </Button>
            )}
            <Tooltip content="Duplicate">
              <Button variant="ghost" size="icon-sm" onClick={() => duplicate(p.id)} aria-label={`Duplicate ${p.internal_name}`}>
                <CopyPlus />
              </Button>
            </Tooltip>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/admin/landing-pages/${p.id}`} aria-label={`Edit ${p.internal_name}`}>
                <Pencil />
              </Link>
            </Button>
            <ConfirmButton
              title={`Delete ${p.internal_name}?`}
              description="The page, its stats and its uploaded files are removed. This cannot be undone."
              onConfirm={() => remove(p.id)}
            >
              <Button variant="ghost" size="icon-sm" aria-label={`Delete ${p.internal_name}`}>
                <Trash2 />
              </Button>
            </ConfirmButton>
          </div>
        </div>
      ))}
    </Panel>
  );
}
