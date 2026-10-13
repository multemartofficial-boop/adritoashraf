"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteItemAction, reorderAction, setPublishedAction } from "@/lib/admin/content-actions";
import type { ContentTable } from "@/lib/validators/content";

type Item = { id: string; is_published: boolean };

/** Optimistic reorder / publish / delete for a content table. */
export function useContentList<T extends Item>(table: ContentTable, initial: T[]) {
  const [items, setItems] = useState(initial);
  const [source, setSource] = useState(initial);
  const [, startTransition] = useTransition();

  // Accept fresh server data after revalidation (e.g. a new item was created).
  if (source !== initial) {
    setSource(initial);
    setItems(initial);
  }

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const prev = items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(async () => {
      const res = await reorderAction(table, next.map((i) => i.id));
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Could not reorder.");
      }
    });
  };

  const setPublished = (id: string, value: boolean) => {
    const prev = items;
    setItems(items.map((i) => (i.id === id ? { ...i, is_published: value } : i)));
    startTransition(async () => {
      const res = await setPublishedAction(table, id, value);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Could not update.");
      } else toast.success(value ? "Published" : "Hidden from the site");
    });
  };

  const remove = async (id: string) => {
    const res = await deleteItemAction(table, id);
    if (!res.ok) {
      toast.error(res.error ?? "Could not delete.");
      return;
    }
    setItems((cur) => cur.filter((i) => i.id !== id));
    toast.success("Deleted");
  };

  return { items, move, setPublished, remove };
}
