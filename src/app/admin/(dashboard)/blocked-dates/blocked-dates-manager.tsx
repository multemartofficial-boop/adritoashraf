"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";
import { parseBlockedDateForm } from "@/lib/validators/booking";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/input";
import { addBlockedDateAction, removeBlockedDateAction } from "./actions";

type Row = { id: string; date: string; reason: string };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );

export function BlockedDatesManager({ dates }: { dates: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { formAction, onSubmit, pending: adding, errors, state } = useAdminForm(addBlockedDateAction, parseBlockedDateForm);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Panel className="h-fit p-5">
        <h2 className="text-sm font-semibold">Block a date</h2>
        <form key={state.savedAt ?? 0} action={formAction} onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
          <Field label="Date" htmlFor="date" error={errors.date}>
            <Input {...errProps("date", errors.date)} type="date" min={today} />
          </Field>
          <Field label="Reason (optional)" htmlFor="reason" error={errors.reason}>
            <Input {...errProps("reason", errors.reason)} placeholder="Holiday, travel…" maxLength={120} />
          </Field>
          <Button type="submit" disabled={adding} className="w-full">
            {adding ? <Loader2 className="animate-spin" /> : <Plus />} Block this date
          </Button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        {dates.length === 0 ? (
          <EmptyState icon={CalendarOff} title="No blocked dates" description="Every weekday window is open for booking." />
        ) : (
          <ul className="divide-y divide-admin-border">
            {dates.map((d) => (
              <li key={d.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{fmt(d.date)}</p>
                  {d.reason && <p className="truncate text-xs text-admin-muted">{d.reason}</p>}
                </div>
                <ConfirmButton
                  title="Unblock this date?"
                  description="The day's weekly availability will be bookable again."
                  confirmLabel="Unblock"
                  onConfirm={() =>
                    start(async () => {
                      const r = await removeBlockedDateAction(d.id);
                      if (r.ok) {
                        toast.success("Date unblocked.");
                        router.refresh();
                      } else toast.error(r.error ?? "Failed.");
                    })
                  }
                >
                  <Button variant="ghost" size="icon" aria-label={`Unblock ${fmt(d.date)}`} disabled={pending}>
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
