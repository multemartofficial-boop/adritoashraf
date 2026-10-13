"use server";

import { z } from "zod";
import { revalidatePublic, runAdmin } from "@/lib/admin/run";
import { isSafeMediaPath, storage } from "@/lib/storage";
import type { ActionResult } from "@/lib/forms";

export async function deleteMediaAction(path: string): Promise<ActionResult> {
  return runAdmin(async () => {
    const p = z.string().max(200).parse(path);
    if (!isSafeMediaPath(p)) return { ok: false, error: "Invalid file." };
    await storage().remove("public", [p]);
    revalidatePublic("/admin/media");
    return { ok: true };
  });
}
