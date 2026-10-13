import "server-only";
import { NextResponse } from "next/server";
import { requireAdminAction, UnauthorizedError, type AdminSession } from "./session";

/**
 * CSRF guard for mutating API routes (server actions already get this from Next.js):
 * the Origin header must match the request host.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Wraps an admin API route: same-origin check for mutations + admin session re-check. */
export function adminRoute<Ctx>(
  handler: (request: Request, session: AdminSession, ctx: Ctx) => Promise<Response>,
) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    if (request.method !== "GET" && request.method !== "HEAD" && !isSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const session = await requireAdminAction();
      return await handler(request, session, ctx);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.error("[admin api]", err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
