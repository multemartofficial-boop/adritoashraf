"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquareQuote, Plus, Star, Video } from "lucide-react";
import type { TestimonialRow } from "@/types/database";
import { EmptyState } from "@/components/admin/empty-state";
import { RowControls } from "@/components/admin/list/row-controls";
import { useContentList } from "@/components/admin/list/use-content-list";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Item = Pick<
  TestimonialRow,
  "id" | "type" | "client_name" | "client_role" | "avatar_url" | "poster_url" | "content" | "rating" | "is_published"
>;

export function TestimonialsList({ initial }: { initial: Item[] }) {
  const { items, move, setPublished, remove } = useContentList("testimonials", initial);

  if (items.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={MessageSquareQuote}
          title="No testimonials yet"
          description="Ask happy clients for a short review or a video, then add it here."
          action={
            <Button asChild>
              <Link href="/admin/testimonials/new">
                <Plus /> New Testimonial
              </Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel className="divide-y divide-admin-border overflow-hidden">
      {items.map((t, i) => {
        const img = t.type === "video" ? t.poster_url || t.avatar_url : t.avatar_url;
        return (
          <div key={t.id} className="flex flex-col gap-3 p-3 transition-colors hover:bg-black/[0.015] sm:flex-row sm:items-center sm:p-4">
            <Link href={`/admin/testimonials/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-violet-200 to-orange-200 text-sm font-semibold text-violet-900">
                {img ? <Image src={img} alt="" fill sizes="44px" className="object-cover" /> : t.client_name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold">{t.client_name}</span>
                  <Badge tone={t.type === "video" ? "info" : "neutral"}>
                    {t.type === "video" && <Video className="size-3" />}
                    {t.type === "video" ? "Video" : "Text"}
                  </Badge>
                  {!t.is_published && <Badge tone="warning">Hidden</Badge>}
                </span>
                <span className="block truncate text-xs text-admin-muted">
                  {t.client_role}
                  {t.content && ` · “${t.content}”`}
                </span>
                <span className="mt-0.5 flex text-orange-500" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} className={s < t.rating ? "size-3 fill-current" : "size-3 opacity-25"} />
                  ))}
                </span>
              </span>
            </Link>
            <RowControls
              label={t.client_name}
              index={i}
              count={items.length}
              published={t.is_published}
              editHref={`/admin/testimonials/${t.id}`}
              onMove={(d) => move(i, d)}
              onPublish={(v) => setPublished(t.id, v)}
              onDelete={() => remove(t.id)}
            />
          </div>
        );
      })}
    </Panel>
  );
}
