import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// Baseline CSP. Next.js inline bootstrap scripts need 'unsafe-inline' unless every page
// is rendered dynamically with nonces, which would defeat static caching on a 1GB host.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  `media-src 'self' blob: ${supabaseOrigin} https://*.youtube.com https://*.vimeo.com`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // In dev the page may be embedded by the IDE browser preview.
  ...(isDev ? [] : ["frame-ancestors 'none'"]),
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for cPanel (build locally, upload .next/standalone).
  output: "standalone",
  // The IDE browser preview proxies through 127.0.0.1 — allow its HMR requests.
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // No on-server image optimizer: saves RAM on shared hosting and avoids native `sharp`
    // binaries. Images are pre-optimized (WebP) at upload/build time instead.
    unoptimized: true,
    remotePatterns: supabaseOrigin
      ? [{ protocol: "https", hostname: new URL(supabaseOrigin).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  outputFileTracingExcludes: {
    "/*": ["node_modules/sharp/**/*", "node_modules/@img/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
