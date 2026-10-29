"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants";
import { useLibrary } from "@/providers/library-provider";
import { useAuthStore } from "@/store/auth-store";
import { useLibraryAuthStore } from "@/features/library/auth-store";
import { libraryAuthApi } from "@/features/library/auth-api";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { readLibrarySessionCookie } from "@/lib/library-session-cookie";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: ROUTES.LIBRARY, label: "Home" },
  { href: ROUTES.LIBRARY_BROWSE, label: "Browse" },
] as const;

const AUTH_LINKS = [
  { href: ROUTES.LIBRARY_DASHBOARD, label: "My dashboard" },
  { href: ROUTES.LIBRARY_HISTORY, label: "History" },
  { href: ROUTES.LIBRARY_REPORT, label: "Report" },
  { href: ROUTES.LIBRARY_CHILDREN, label: "Children" },
] as const;

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || (href !== ROUTES.LIBRARY && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn("text-stone-600 hover:text-stone-900", active && "font-medium text-stone-900")}
    >
      {label}
    </Link>
  );
}

/** Library chrome is always standalone — no Portal back-link (separate domain). */
export function LibraryShell({ children }: { children: React.ReactNode }) {
  const { authMode } = useLibrary();
  const pathname = usePathname();
  const portalUser = useAuthStore((s) => s.user);
  const libraryUser = useLibraryAuthStore((s) => s.user);
  const setSession = useLibraryAuthStore((s) => s.setSession);
  const logout = useLibraryAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const librarySession = readLibrarySessionCookie();
  const libraryEmailVerified = libraryUser?.emailVerified ?? librarySession?.emailVerified ?? false;
  /** Member nav only after real access: portal parent, or library parent with verified email. */
  const showMemberNav = authMode === "portal" || (authMode === "library" && libraryEmailVerified);
  const hasUnverifiedLibrarySession = authMode === "library" && !libraryEmailVerified;
  const signedIn = showMemberNav;

  useEffect(() => {
    if (authMode !== "library" || !libraryEmailVerified || libraryUser) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await ensureLibraryAccessToken();
        if (!token || cancelled) return;
        const res = await libraryAuthApi.me();
        if (cancelled || !res.data) return;
        setSession(token, res.data);
      } catch {
        // Stay on cookie-only session; greeting falls back to "Signed in".
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authMode, libraryEmailVerified, libraryUser, setSession]);

  const greeting = libraryUser?.firstName
    ? `Hi, ${libraryUser.firstName}`
    : portalUser?.firstName
      ? `Hi, ${portalUser.firstName}`
      : "Signed in";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-slate-900">
      <header className="border-b border-stone-200 bg-stone-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href={ROUTES.LIBRARY} className="font-serif text-2xl tracking-tight text-stone-900">
            Handwith Library
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {PUBLIC_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
            {showMemberNav &&
              AUTH_LINKS.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} pathname={pathname} />
              ))}
            {signedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-stone-500">{greeting}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="cursor-pointer rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
                >
                  {loggingOut ? "Signing out…" : "Log out"}
                </button>
              </div>
            ) : hasUnverifiedLibrarySession ? (
              <div className="flex items-center gap-3">
                <span className="text-stone-500">Verify your email</span>
                <Link href={ROUTES.LIBRARY_LOGIN} className="text-stone-600 hover:text-stone-900">
                  Log in
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="cursor-pointer rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
                >
                  {loggingOut ? "Signing out…" : "Log out"}
                </button>
              </div>
            ) : (
              <>
                <Link href={ROUTES.LIBRARY_LOGIN} className="text-stone-600 hover:text-stone-900">
                  Log in
                </Link>
                <Link
                  href={ROUTES.LIBRARY_REGISTER}
                  className="rounded-md bg-stone-900 px-3 py-1.5 font-medium text-white hover:bg-stone-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        Handwith Content Library — games, activities, and videos for home practice
      </footer>
    </div>
  );
}
