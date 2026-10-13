"use client";

import { ListOrdered } from "lucide-react";
import type { ProcessStepRow } from "@/types/database";
import { parseProcessStepForm } from "@/lib/validators/content";
import { SimpleItemsManager } from "@/components/admin/list/simple-items-manager";
import { saveProcessStepAction } from "./actions";

export function ProcessManager({ initial }: { initial: Pick<ProcessStepRow, "id" | "title" | "description" | "is_published">[] }) {
  return (
    <SimpleItemsManager
      config={{
        table: "process_steps",
        noun: "step",
        icon: ListOrdered,
        numbered: true,
        emptyText: "Describe how a project goes from first call to launch, in 4 to 5 steps.",
        fields: [
          { name: "title", label: "Step title", placeholder: "Discovery" },
          { name: "description", label: "Description", multiline: true, rows: 3 },
        ],
      }}
      initial={initial}
      save={saveProcessStepAction}
      parse={parseProcessStepForm}
    />
  );
}
