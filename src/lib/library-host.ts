/**
 * Content Library host helpers — dual URL (portal path + library subdomain).
 * Used by proxy.ts (Edge) and client/server layouts.
 */

/** Hostnames treated as the standalone library site (no portal chrome). */
export function isLibraryHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  const configured = process.env.NEXT_PUBLIC_LIBRARY_HOST?.toLowerCase().trim();

  if (configured && (host === configured || host === configured.split(":")[0])) {
    return true;
  }

  // Local / staging conventions: library.localhost, library.handwith.com
  if (host === "library.localhost" || host === "library.local") return true;
  if (host.startsWith("library.")) return true;

  return false;
}

/**
 * On the library subdomain, map bare paths onto the `/library/*` App Router tree
 * so one codebase serves both `library.handwith.com/browse` and `app.com/library/browse`.
 */
export function resolveLibraryPathname(pathname: string, libraryHost: boolean): string {
  if (!libraryHost) return pathname;
  if (pathname.startsWith("/library")) return pathname;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return pathname;

  if (pathname === "/") return "/library";
  return `/library${pathname}`;
}

/** Header set by proxy so Server Components know standalone vs portal embed. */
export const LIBRARY_STANDALONE_HEADER = "x-library-standalone";
