"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";

export type LibraryAuthMode = "anonymous" | "portal" | "library";

interface LibraryContextValue {
  /** True when serving from library.* host (standalone chrome). */
  isStandalone: boolean;
  /** Portal user is logged in (therapy-center parent / staff). */
  hasPortalSession: boolean;
  /**
   * Library-only session cookie present (set on library login/register).
   * Checked client-side via document.cookie for UX only.
   */
  hasLibrarySession: boolean;
  authMode: LibraryAuthMode;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function readHasLibrarySessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)library-session=/.test(document.cookie);
}

export function LibraryProvider({
  isStandalone,
  children,
}: {
  isStandalone: boolean;
  children: ReactNode;
}) {
  const portalUser = useAuthStore((s) => s.user);
  const hasPortalSession = portalUser !== null;
  const hasLibrarySession = readHasLibrarySessionCookie();

  const value = useMemo<LibraryContextValue>(() => {
    let authMode: LibraryAuthMode = "anonymous";
    if (hasPortalSession) authMode = "portal";
    else if (hasLibrarySession) authMode = "library";

    return {
      isStandalone,
      hasPortalSession,
      hasLibrarySession,
      authMode,
    };
  }, [isStandalone, hasPortalSession, hasLibrarySession]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return ctx;
}
