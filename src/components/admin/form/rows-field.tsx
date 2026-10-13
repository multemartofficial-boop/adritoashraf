"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FieldErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

type Column = {
  key: string;
  label: string;
  placeholder?: string;
  options?: readonly string[];
  className?: string;
};
type Row = Record<string, string>;

/** Repeating rows of small fields (nav links, stats, social links), submitted as JSON. */
export function RowsField({
  name,
  columns,
  defaultValue = [],
  max = 10,
  addLabel = "Add row",
  errors = {},
}: {
  name: string;
  columns: Column[];
  defaultValue?: Row[];
  max?: number;
  addLabel?: string;
  errors?: FieldErrors;
}) {
  const blank = () => Object.fromEntries(columns.map((c) => [c.key, c.options?.[0] ?? ""])) as Row;
  const [rows, setRows] = useState<Row[]>(defaultValue.map((r) => ({ ...blank(), ...r })));

  const update = (i: number, key: string, value: string) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setRows(next);
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-start gap-2 rounded-xl border border-admin-border bg-white/60 p-2 sm:flex-nowrap">
          {columns.map((col) => {
            const err = errors[`${name}.${i}.${col.key}`];
            const id = `${name}-${i}-${col.key}`;
            return (
              <div key={col.key} className={cn("min-w-0 flex-1 basis-full sm:basis-auto", col.className)}>
                <label htmlFor={id} className="sr-only">
                  {col.label} {i + 1}
                </label>
                {col.options ? (
                  <Select id={id} value={row[col.key]} onChange={(e) => update(i, col.key, e.target.value)}>
                    {col.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={id}
                    value={row[col.key]}
                    placeholder={col.placeholder ?? col.label}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    aria-invalid={Boolean(err) || undefined}
                  />
                )}
                {err && <p className="mt-1 text-xs text-admin-danger">{err}</p>}
              </div>
            );
          })}
          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => move(i, 1)}
              disabled={i === rows.length - 1}
              aria-label="Move down"
            >
              <ArrowDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              aria-label="Remove row"
              className="hover:text-admin-danger"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => setRows([...rows, blank()])} disabled={rows.length >= max}>
        <Plus /> {addLabel}
      </Button>
    </div>
  );
}
