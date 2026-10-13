import { Hammer } from "lucide-react";
import { PageHeader } from "./page-header";
import { Panel } from "./panel";

/** Temporary placeholder for modules scheduled in a later build phase. */
export function ComingSoon({ title, description, phase }: { title: string; description: string; phase: number }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Panel className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="grid size-11 place-items-center rounded-2xl bg-black/[0.04] text-admin-muted">
          <Hammer className="size-5" />
        </span>
        <p className="text-sm font-medium">{`This module is built in Phase ${phase}.`}</p>
        <p className="max-w-sm text-sm text-admin-muted">The navigation and access control are already wired up.</p>
      </Panel>
    </div>
  );
}
