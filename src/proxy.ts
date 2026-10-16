import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env/public";
import { supabasePublic } from "@/lib/supabase/public";
import { updateSession } from "@/lib/supabase/proxy";

// Canonical origin (e.g. https://adritoashraf.com). www. and plain-http requests
// permanently redirect so exactly one origin is indexable.
const canonical = new URL(publicEnv.NEXT_PUBLIC_SITE_URL);
const CANONICAL_HOST = canonical.host;
const ENFORCE = canonical.protocol === "https:";

function canonicalRedirect(request: NextRequest): NextResponse | null {
  if (!ENFORCE) return null;
  const host = request.headers.get("host") ?? "";
  const wrongHost = host === `www.${CANONICAL_HOST}`;
  const wrongScheme =
    request.headers.get("x-forwarded-proto") === "http" &&
    (host === CANONICAL_HOST || wrongHost);
  if (!wrongHost && !wrongScheme) return null;
  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 301);
}

// 301 redirects managed in /admin/redirects. Cached for a minute; a database
// hiccup degrades to "no redirects" rather than breaking the site.
const REDIRECT_CACHE_MS = 60_000;
let redirectCache: { at: number; map: Map<string, string> } | null = null;

async function managedRedirect(pathname: string) {
  try {
    if (!redirectCache || Date.now() - redirectCache.at > REDIRECT_CACHE_MS) {
      const { data } = await supabasePublic()
        .from("redirects")
        .select("from_path, to_path")
        .eq("is_active", true)
        .limit(1000);
      redirectCache = {
        at: Date.now(),
        map: new Map((data ?? []).map((r) => [r.from_path, r.to_path])),
      };
    }
    const trimmed =
      pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    return redirectCache.map.get(trimmed);
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  // 1. One canonical domain, always https.
  const canon = canonicalRedirect(request);
  if (canon) return canon;

  // 2. Admin session guard (first line of defence; pages/actions re-check too).
  if (isAdminPath) {
    const { response, user } = await updateSession(request);
    if (pathname.startsWith("/api/admin")) {
      return user
        ? response
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // 3. Managed 301 redirects for public paths (never shadows /admin or /api).
  if (
    request.method === "GET" &&
    !pathname.startsWith("/api") &&
    !pathname.includes(".")
  ) {
    const to = await managedRedirect(pathname);
    if (to)
      return NextResponse.redirect(
        to.startsWith("/") ? new URL(to, request.url) : new URL(to),
        301,
      );
  }

  // 4. Non-canonical hosts (preview deploys, IPs) must never be indexed.
  const response = NextResponse.next();
  if (host !== CANONICAL_HOST) response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = {
  // Everything except Next internals and files with an extension (images, fonts,
  // robots.txt, sitemap.xml, icons...).
  matcher: [
    "/((?!_next/static|_next/image|_next/hmr|.*\\.[a-zA-Z0-9]{2,5}$).*)",
  ],
};
