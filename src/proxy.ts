import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// First line of defence for /admin and /api/admin. Every page, server action and
// API route ALSO re-checks the admin session itself (src/lib/auth/session.ts).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (pathname.startsWith("/api/admin")) {
    return user ? response : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
