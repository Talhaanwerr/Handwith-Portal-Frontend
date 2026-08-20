import type { NextConfig } from "next";
import path from "path";

/**
 * Production security headers for the App Router.
 * CSP is intentionally moderate so Next.js inline scripts/styles still work;
 * tighten further per-deployment (nonce-based CSP) when ready.
 */
const isProd = process.env.NODE_ENV === "production";

/** CSP connect-src needs an origin (scheme + host + port), not a path like /api/v1. */
function apiConnectOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4601/api/v1";
  if (raw.startsWith("/")) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:4601";
  }
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  isProd ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `connect-src 'self'${apiConnectOrigin() ? ` ${apiConnectOrigin()}` : ""}${isProd ? "" : " ws: wss:"}`,
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Required for Docker standalone builds — emits a minimal server.js with
  // only the files needed at runtime (no node_modules copy required).
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
