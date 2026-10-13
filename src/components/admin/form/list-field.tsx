"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Editable list of short strings, submitted as a JSON hidden input. */
export function ListField({
  name,
  defaultValue = [],
  placeholder = "Type and press Enter",
  max = 20,
  error,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  max?: number;
  error?: string;
}) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || items.length >= max || items.includes(v)) return;
    setItems([...items, v]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-admin-border bg-white py-1 pr-1 pl-3 text-xs"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="rounded-full p-0.5 text-admin-muted hover:bg-black/5 hover:text-admin-danger"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          id={name}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={items.length >= max ? `Maximum ${max} items` : placeholder}
          disabled={items.length >= max}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <Button type="button" variant="outline" size="icon" onClick={add} aria-label="Add item" disabled={!draft.trim()}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}
