import type { LibraryAuthMode } from "@/providers/library-provider";
import type { LibraryTier } from "@/lib/library-session-cookie";

/**
 * Premium play gating for Content Library.
 * - Portal session: therapy-center parents inherit premium access.
 * - Library session: use account tier from cookie / auth store.
 * - Anonymous: free content only.
 */
export function canPlayContent(opts: {
  contentTier: "FREE" | "PREMIUM";
  authMode: LibraryAuthMode;
  libraryTier?: LibraryTier | null;
}): boolean {
  if (opts.contentTier === "FREE") return true;
  if (opts.authMode === "portal") return true;
  if (opts.authMode === "library" && opts.libraryTier === "PREMIUM") return true;
  return false;
}
