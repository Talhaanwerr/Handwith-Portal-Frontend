import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "origin",
  "referer",
]);

const RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "pragma",
  "expires",
  "x-request-id",
];

/**
 * Railway sets Secure + SameSite=None (cross-site). After this same-origin
 * proxy the cookie belongs to the frontend host, so drop Domain/Partitioned,
 * use Lax, and drop Secure on http://localhost.
 */
function rewriteSetCookie(value: string, isHttps: boolean): string {
  let next = value.replace(/;\s*Domain=[^;]*/gi, "");
  next = next.replace(/;\s*Partitioned/gi, "");
  next = next.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  if (!isHttps) {
    next = next.replace(/;\s*Secure/gi, "");
  }
  return next;
}

async function proxyRequest(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const target = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  if (!target) {
    return NextResponse.json({ message: "API_PROXY_TARGET is not configured" }, { status: 500 });
  }

  const { path } = await ctx.params;
  const dest = `${target}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const upstream = await fetch(dest, {
    method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const out = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }

  const isHttps = req.nextUrl.protocol === "https:";
  const cookies =
    typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : [];
  for (const cookie of cookies) {
    out.append("set-cookie", rewriteSetCookie(cookie, isHttps));
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;
