"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2, MoveRight, Plus, Trash2 } from "lucide-react";
import { parseRedirectForm } from "@/lib/validators/content";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { addRedirectAction, deleteRedirectAction, toggleRedirectAction } from "./actions";

type Row = { id: string; from_path: string; to_path: string; is_active: boolean };

export function RedirectsManager({ redirects }: { redirects: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { formAction, onSubmit, pending: adding, errors, state } = useAdminForm(addRedirectAction, parseRedirectForm);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Panel className="h-fit p-5">
        <h2 className="text-sm font-semibold">Add a redirect</h2>
        <form key={state.savedAt ?? 0} action={formAction} onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
          <Field label="From path" htmlFor="from_path" error={errors.from_path} hint="The old address, e.g. /old-page.">
            <Input {...errProps("from_path", errors.from_path)} placeholder="/old-page" />
          </Field>
          <Field label="To" htmlFor="to_path" error={errors.to_path} hint="A /path on this site, or a full https:// URL.">
            <Input {...errProps("to_path", errors.to_path)} placeholder="/new-page or https://…" />
          </Field>
          <Button type="submit" disabled={adding} className="w-full">
            {adding ? <Loader2 className="animate-spin" /> : <Plus />} Add redirect
          </Button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        {redirects.length === 0 ? (
          <EmptyState icon={MoveRight} title="No redirects" description="Add one when a page moves or an old link needs a new home." />
        ) : (
          <ul className="divide-y divide-admin-border">
            {redirects.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                <Switch
                  checked={r.is_active}
                  onCheckedChange={(v) =>
                    start(async () => {
                      const res = await toggleRedirectAction(r.id, v);
                      if (res.ok) router.refresh();
                      else toast.error(res.error ?? "Failed.");
                    })
                  }
                  aria-label={r.is_active ? "Disable redirect" : "Enable redirect"}
                  disabled={pending}
                />
                <div className="min-w-0 flex-1 font-mono text-sm">
                  <p className="truncate">{r.from_path}</p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-admin-muted">
                    <ArrowRight className="size-3 shrink-0" /> {r.to_path}
                  </p>
                </div>
                <ConfirmButton
                  title="Delete this redirect?"
                  description={`${r.from_path} will stop redirecting immediately.`}
                  confirmLabel="Delete"
                  onConfirm={() =>
                    start(async () => {
                      const res = await deleteRedirectAction(r.id);
                      if (res.ok) {
                        toast.success("Redirect deleted.");
                        router.refresh();
                      } else toast.error(res.error ?? "Failed.");
                    })
                  }
                >
                  <Button variant="ghost" size="icon" aria-label={`Delete redirect ${r.from_path}`} disabled={pending}>
                    <Trash2 className="text-admin-danger" />
                  </Button>
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
