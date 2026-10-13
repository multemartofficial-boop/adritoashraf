"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, type LucideIcon } from "lucide-react";
import type { z } from "zod";
import type { FormState } from "@/lib/forms";
import type { ContentTable } from "@/lib/validators/content";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RowControls } from "./row-controls";
import { useContentList } from "./use-content-list";

type FieldDef = { name: string; label: string; multiline?: boolean; rows?: number; placeholder?: string };
type Item = { id: string; is_published: boolean } & Record<string, string | boolean | number>;
type SaveAction = (id: string | null, state: FormState, fd: FormData) => Promise<FormState>;

export type SimpleItemsConfig = {
  table: ContentTable;
  noun: string;
  icon: LucideIcon;
  fields: [FieldDef, FieldDef];
  emptyText: string;
  numbered?: boolean;
};

/** Ordered list of two-field items edited in a dialog (How I Work steps, FAQs). */
export function SimpleItemsManager({
  config,
  initial,
  save,
  parse,
}: {
  config: SimpleItemsConfig;
  initial: Item[];
  save: SaveAction;
  parse: (fd: FormData) => z.ZodSafeParseResult<unknown>;
}) {
  const { items, move, setPublished, remove } = useContentList(config.table, initial);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [primary, secondary] = config.fields;

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus /> Add {config.noun}
        </Button>
      </div>

      <Panel className="divide-y divide-admin-border overflow-hidden">
        {items.length === 0 ? (
          <EmptyState icon={config.icon} title={`No ${config.noun}s yet`} description={config.emptyText} />
        ) : (
          items.map((item, i) => (
            <div key={item.id} className="flex flex-col gap-3 p-3 transition-colors hover:bg-black/[0.015] sm:flex-row sm:items-center sm:p-4">
              <button type="button" onClick={() => setEditing(item)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                {config.numbered && (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{String(item[primary.name])}</span>
                  <span className="line-clamp-2 text-xs text-admin-muted">{String(item[secondary.name])}</span>
                </span>
              </button>
              <RowControls
                label={String(item[primary.name])}
                index={i}
                count={items.length}
                published={item.is_published}
                onEdit={() => setEditing(item)}
                onMove={(d) => move(i, d)}
                onPublish={(v) => setPublished(item.id, v)}
                onDelete={() => remove(item.id)}
              />
            </div>
          ))
        )}
      </Panel>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing !== null && (
          <DialogContent title={editing === "new" ? `Add ${config.noun}` : `Edit ${config.noun}`}>
            <ItemForm
              key={editing === "new" ? "new" : editing.id}
              item={editing === "new" ? undefined : editing}
              fields={config.fields}
              action={save.bind(null, editing === "new" ? null : editing.id)}
              parse={parse}
              onDone={() => setEditing(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function ItemForm({
  item,
  fields,
  action,
  parse,
  onDone,
}: {
  item?: Item;
  fields: FieldDef[];
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  parse: (fd: FormData) => z.ZodSafeParseResult<unknown>;
  onDone: () => void;
}) {
  const { formAction, onSubmit, pending, errors, state } = useAdminForm(action, parse);

  useEffect(() => {
    if (state.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {fields.map((f) => (
        <Field key={f.name} label={f.label} htmlFor={f.name} error={errors[f.name]}>
          {f.multiline ? (
            <Textarea {...errProps(f.name, errors[f.name])} rows={f.rows ?? 4} defaultValue={String(item?.[f.name] ?? "")} placeholder={f.placeholder} />
          ) : (
            <Input {...errProps(f.name, errors[f.name])} defaultValue={String(item?.[f.name] ?? "")} placeholder={f.placeholder} autoFocus />
          )}
        </Field>
      ))}
      <label className="flex items-center gap-3">
        <Switch name="is_published" defaultChecked={item?.is_published ?? true} />
        <span className="text-sm font-medium">Published</span>
      </label>
      <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
      </div>
    </form>
  );
}
