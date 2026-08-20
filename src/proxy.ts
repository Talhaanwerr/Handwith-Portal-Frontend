import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionCookie } from "@/lib/session-cookie";
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

/** Always reachable (auth status handled per-route below). */
const ALWAYS_ALLOWED = ["/403", "/account-suspended"];

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

function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED.includes(pathname);
}

function isSuperAdminRoute(pathname: string): boolean {
  return SUPER_ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ─── Proxy (Next.js 16) ───────────────────────────────────────────────────────

/**
 * UX routing only — not a security boundary.
 * Backend JWT + RBAC/permissions must enforce real authorization.
 *
 * Next.js 16: `middleware.ts` → `proxy.ts` (named export `proxy`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const session = parseSessionCookie(cookieHeader);
  const isAuthenticated = session !== null;

  // Static error / status pages
  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  // Public auth pages
  if (isPublic(pathname)) {
    if (isAuthenticated && PUBLIC_PATHS.includes(pathname)) {
      if (session.tenantStatus === "SUSPENDED") {
        return NextResponse.redirect(new URL("/account-suspended", request.url));
      }
      return NextResponse.redirect(new URL(getHomePath(session.role), request.url));
    }
    return NextResponse.next();
  }

  // Everything else requires a session cookie hint
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Do not stamp `redirect=/` — that would send super admins to the tenant dashboard
    // after login because `/` used to hard-redirect to `/dashboard`.
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(getHomePath(session.role), request.url));
  }

  // Suspended tenants — lock down the app
  if (session.tenantStatus === "SUSPENDED" && pathname !== "/account-suspended") {
    return NextResponse.redirect(new URL("/account-suspended", request.url));
  }

  // Super-admin area
  if (isSuperAdminRoute(pathname) && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  // Tenant protected routes — authenticated is enough for UX gate
  if (isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
