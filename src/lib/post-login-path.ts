import { ROUTES } from "@/constants";
import type { UserRole } from "@/types";

/** Routes a super admin may resume after login. */
const SUPER_ADMIN_ALLOWED_PREFIXES = ["/super-admin", "/play"] as const;

/** Tenant-app routes a workspace user may resume after login. */
const TENANT_ALLOWED_PREFIXES = [
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
] as const;

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getHomePath(role: UserRole): string {
  return role === "SUPER_ADMIN" ? ROUTES.SUPER_ADMIN_DASHBOARD : ROUTES.TENANT_DASHBOARD;
}

/**
 * Pick the post-login destination.
 * Never send a SUPER_ADMIN to the tenant /dashboard just because login had
 * `?redirect=/dashboard` (that happens when `/` or `/dashboard` bounced them
 * to login while unauthenticated).
 */
export function getPostLoginPath(role: UserRole, redirectTo?: string | null): string {
  const home = getHomePath(role);
  if (!redirectTo || !isSafeInternalPath(redirectTo)) return home;

  const pathname = redirectTo.split("?")[0] ?? "";
  if (pathname === "/" || pathname === "") return home;

  const allowed = role === "SUPER_ADMIN" ? SUPER_ADMIN_ALLOWED_PREFIXES : TENANT_ALLOWED_PREFIXES;

  return matchesPrefix(pathname, allowed) ? redirectTo : home;
}
