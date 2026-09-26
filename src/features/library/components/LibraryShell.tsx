"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants";
import { useLibrary } from "@/providers/library-provider";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const STANDALONE_LINKS = [
  { href: ROUTES.LIBRARY, label: "Home" },
  { href: ROUTES.LIBRARY_BROWSE, label: "Browse" },
  { href: ROUTES.LIBRARY_DASHBOARD, label: "My dashboard" },
  { href: ROUTES.LIBRARY_HISTORY, label: "History" },
  { href: ROUTES.LIBRARY_CHILDREN, label: "Children" },
] as const;

export function LibraryShell({ children }: { children: React.ReactNode }) {
  const { isStandalone, authMode } = useLibrary();
  const pathname = usePathname();
  const portalUser = useAuthStore((s) => s.user);

  if (!isStandalone) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href={ROUTES.TENANT_DASHBOARD}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                ← Portal
              </Link>
              <span className="text-slate-300">|</span>
              <Link href={ROUTES.LIBRARY} className="text-sm font-semibold text-slate-900">
                Content Library
              </Link>
            </div>
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href={ROUTES.LIBRARY_BROWSE}
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  pathname.startsWith(ROUTES.LIBRARY_BROWSE) && "font-medium text-slate-900"
                )}
              >
                Browse
              </Link>
              <Link
                href={ROUTES.LIBRARY_DASHBOARD}
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  pathname.startsWith(ROUTES.LIBRARY_DASHBOARD) && "font-medium text-slate-900"
                )}
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.LIBRARY_HISTORY}
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  pathname.startsWith(ROUTES.LIBRARY_HISTORY) && "font-medium text-slate-900"
                )}
              >
                History
              </Link>
              <Link
                href={ROUTES.LIBRARY_CHILDREN}
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  pathname.startsWith(ROUTES.LIBRARY_CHILDREN) && "font-medium text-slate-900"
                )}
              >
                Children
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-slate-900">
      <header className="border-b border-stone-200 bg-stone-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href={ROUTES.LIBRARY} className="font-serif text-2xl tracking-tight text-stone-900">
            Handwith Library
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {STANDALONE_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-stone-600 hover:text-stone-900",
                  (pathname === href || (href !== ROUTES.LIBRARY && pathname.startsWith(href))) &&
                    "font-medium text-stone-900"
                )}
              >
                {label}
              </Link>
            ))}
            {authMode === "anonymous" ? (
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
            ) : (
              <span className="text-stone-500">
                {portalUser?.name ? `Hi, ${portalUser.firstName}` : "Signed in"}
              </span>
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
