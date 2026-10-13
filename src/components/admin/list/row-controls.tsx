"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";

export function RowControls({
  label,
  index,
  count,
  published,
  editHref,
  onEdit,
  onMove,
  onPublish,
  onDelete,
  deleteDescription,
}: {
  label: string;
  index: number;
  count: number;
  published: boolean;
  editHref?: string;
  onEdit?: () => void;
  onMove: (delta: -1 | 1) => void;
  onPublish: (value: boolean) => void;
  onDelete: () => Promise<void>;
  deleteDescription?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip content={published ? "Visible on site" : "Hidden"}>
        <span className="mr-2 inline-flex">
          <Switch checked={published} onCheckedChange={onPublish} aria-label={`Publish ${label}`} />
        </span>
      </Tooltip>
      <Button variant="ghost" size="icon-sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <ArrowUp />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label={`Move ${label} down`}
      >
        <ArrowDown />
      </Button>
      {editHref ? (
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={editHref} aria-label={`Edit ${label}`}>
            <Pencil />
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${label}`}>
          <Pencil />
        </Button>
      )}
      <ConfirmButton
        title={`Delete “${label}”?`}
        description={deleteDescription ?? "This permanently removes it from the site. This cannot be undone."}
        onConfirm={onDelete}
      >
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${label}`} className="hover:text-admin-danger">
          <Trash2 />
        </Button>
      </ConfirmButton>
    </div>
  );
}
