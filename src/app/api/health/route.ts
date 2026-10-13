import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await pingDatabase().catch(() => false);
  return NextResponse.json(
    { ok: db, db: db ? "up" : "down" },
    { status: db ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
