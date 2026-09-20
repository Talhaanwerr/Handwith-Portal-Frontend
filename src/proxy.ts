import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionCookie } from "@/lib/session-cookie";
import { parseLibrarySessionCookie } from "@/lib/library-session-cookie";
import {
  isLibraryHostname,
  resolveLibraryPathname,
  LIBRARY_STANDALONE_HEADER,
} from "@/lib/library-host";
import { getHomePath } from "@/lib/post-login-path";

// ─── Route definitions ────────────────────────────────────────────────────────

/** Fully public — no session required. */
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/select-workspace",
];

/** Public prefix patterns (e.g. /invite/abc123). */
const PUBLIC_PREFIXES = ["/invite/"];

/**
 * Content Library — browse / marketing / auth stubs (no login required).
 * Play gating and score tracking still happen in later phases via the API.
 */
const LIBRARY_PUBLIC_EXACT = new Set(["/library", "/library/login", "/library/register"]);

const LIBRARY_PUBLIC_PREFIXES = ["/library/browse", "/library/game", "/library/verify-email"];

/** Content Library — require portal session OR library-session cookie. */
const LIBRARY_PROTECTED_PREFIXES = [
  "/library/dashboard",
  "/library/history",
  "/library/children",
  "/library/setup-child",
];

/** Always reachable (auth status handled per-route below). */
const ALWAYS_ALLOWED = ["/403", "/account-suspended", "/account-pending"];

function tenantGatePath(status: string | undefined): string | null {
  if (status === "SUSPENDED") return "/account-suspended";
  if (status === "PENDING" || status === "CANCELLED") return "/account-pending";
  return null;
}

/** Routes that require SUPER_ADMIN role. */
const SUPER_ADMIN_PREFIXES = ["/super-admin"];

/** Tenant app routes (any authenticated non-suspended user). */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/users",
  "/roles",
  "/permissions",
  "/settings",
  "/feature-flags",
  "/profile",
  "/activity-logs",
  "/billing",
  "/reports",
  "/branches",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isLibraryPublic(pathname: string): boolean {
  if (LIBRARY_PUBLIC_EXACT.has(pathname)) return true;
  return LIBRARY_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isLibraryProtected(pathname: string): boolean {
  return LIBRARY_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED.includes(pathname);
}

function isSuperAdminRoute(pathname: string): boolean {
  return SUPER_ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function withLibraryHeaders(
  request: NextRequest,
  isStandalone: boolean,
  rewritePathname?: string
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LIBRARY_STANDALONE_HEADER, isStandalone ? "1" : "0");

  if (rewritePathname && rewritePathname !== request.nextUrl.pathname) {
    const url = request.nextUrl.clone();
    url.pathname = rewritePathname;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// ─── Proxy (Next.js 16) ───────────────────────────────────────────────────────

/**
 * UX routing only — not a security boundary.
 * Backend JWT + RBAC/permissions must enforce real authorization.
 *
 * Next.js 16: `middleware.ts` → `proxy.ts` (named export `proxy`).
 *
 * Content Library dual-URL:
 * - `library.*` host → rewrite bare paths onto `/library/*`, standalone chrome
 * - `app.com/library/*` → same routes, embedded chrome (isStandalone=false)
 */
export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const isStandalone = isLibraryHostname(hostname);
  const rawPathname = request.nextUrl.pathname;
  const pathname = resolveLibraryPathname(rawPathname, isStandalone);
  const needsRewrite = pathname !== rawPathname;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const portalSession = parseSessionCookie(cookieHeader);
  const librarySession = parseLibrarySessionCookie(cookieHeader);
  const isPortalAuthenticated = portalSession !== null;
  const hasLibraryAccess = isPortalAuthenticated || librarySession !== null;

  // Static error / status pages
  if (isAlwaysAllowed(pathname)) {
    return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
  }

  // Content Library — public browse / stubs
  if (isLibraryPublic(pathname)) {
    return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
  }

  // Content Library — dashboard etc. (portal JWT hint OR library-session)
  if (isLibraryProtected(pathname)) {
    if (!hasLibraryAccess) {
      const loginPath = isStandalone ? "/library/login" : "/login";
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (portalSession?.tenantStatus) {
      const gate = tenantGatePath(portalSession.tenantStatus);
      if (gate) return NextResponse.redirect(new URL(gate, request.url));
    }
    return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
  }

  // Public portal auth pages
  if (isPublic(pathname)) {
    if (isPortalAuthenticated && PUBLIC_PATHS.includes(pathname)) {
      const gate = tenantGatePath(portalSession.tenantStatus);
      if (gate) return NextResponse.redirect(new URL(gate, request.url));
      return NextResponse.redirect(new URL(getHomePath(portalSession.role), request.url));
    }
    return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
  }

  // Everything else requires a portal session cookie hint
  if (!isPortalAuthenticated) {
    const loginUrl = new URL(isStandalone ? "/library/login" : "/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(getHomePath(portalSession.role), request.url));
  }

  const gate = tenantGatePath(portalSession.tenantStatus);
  if (gate && pathname !== gate) {
    return NextResponse.redirect(new URL(gate, request.url));
  }

  if (isSuperAdminRoute(pathname) && portalSession.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (isProtectedRoute(pathname)) {
    return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
  }

  return withLibraryHeaders(request, isStandalone, needsRewrite ? pathname : undefined);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
