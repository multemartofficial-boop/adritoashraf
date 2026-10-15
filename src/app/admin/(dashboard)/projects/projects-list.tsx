"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import type { ProjectRow } from "@/types/database";
import { EmptyState } from "@/components/admin/empty-state";
import { RowControls } from "@/components/admin/list/row-controls";
import { useContentList } from "@/components/admin/list/use-content-list";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CARD_THEME_META } from "./card-themes";

type Item = Pick<
  ProjectRow,
  | "id"
  | "title"
  | "title_accent"
  | "slug"
  | "short_description"
  | "tags"
  | "cover_image"
  | "card_theme"
  | "is_published"
>;

export function ProjectsList({ initial }: { initial: Item[] }) {
  const { items, move, setPublished, remove } = useContentList(
    "projects",
    initial,
  );

  if (items.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add your first project to show it in the portfolio section."
          action={
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus /> New Project
              </Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel className="divide-y divide-admin-border overflow-hidden">
      {items.map((p, i) => (
        <div
          key={p.id}
          className="flex flex-col gap-3 p-3 transition-colors hover:bg-black/[0.015] sm:flex-row sm:items-center sm:p-4"
        >
          <Link
            href={`/admin/projects/${p.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span
              className={cn(
                "relative h-14 w-24 shrink-0 overflow-hidden rounded-lg",
                CARD_THEME_META[p.card_theme].swatch,
              )}
            >
              {p.cover_image && (
                <Image
                  src={p.cover_image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              )}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">
                  {p.title}{" "}
                  {p.title_accent && (
                    <em className="font-normal">{p.title_accent}</em>
                  )}
                </span>
                {!p.is_published && <Badge>Draft</Badge>}
              </span>
              <span className="block truncate text-xs text-admin-muted">
                /projects/{p.slug}
              </span>
              {p.tags.length > 0 && (
                <span className="mt-1 hidden flex-wrap gap-1 md:flex">
                  {p.tags.slice(0, 4).map((t) => (
                    <Badge key={t} tone="info">
                      {t}
                    </Badge>
                  ))}
                </span>
              )}
            </span>
          </Link>
          <RowControls
            label={p.title}
            index={i}
            count={items.length}
            published={p.is_published}
            editHref={`/admin/projects/${p.id}`}
            onMove={(d) => move(i, d)}
            onPublish={(v) => setPublished(p.id, v)}
            onDelete={() => remove(p.id)}
            deleteDescription="The project, its cover and all gallery screenshots will be permanently deleted."
          />
        </div>
      ))}
    </Panel>
  );
}
