"use client";

import { HelpCircle } from "lucide-react";
import type { FaqRow } from "@/types/database";
import { parseFaqForm } from "@/lib/validators/content";
import { SimpleItemsManager } from "@/components/admin/list/simple-items-manager";
import { saveFaqAction } from "../process/actions";

export function FaqManager({ initial }: { initial: Pick<FaqRow, "id" | "question" | "answer" | "is_published">[] }) {
  return (
    <SimpleItemsManager
      config={{
        table: "faqs",
        noun: "question",
        icon: HelpCircle,
        emptyText: "Answer the questions clients usually ask before booking.",
        fields: [
          { name: "question", label: "Question", placeholder: "How long does a project take?" },
          { name: "answer", label: "Answer", multiline: true, rows: 5 },
        ],
      }}
      initial={initial}
      save={saveFaqAction}
      parse={parseFaqForm}
    />
  );
}
