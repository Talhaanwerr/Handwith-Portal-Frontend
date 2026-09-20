"use client";

import Link from "next/link";
import { ROUTES } from "@/constants";
import { useLibrary } from "@/providers/library-provider";
import { useAuthStore } from "@/store/auth-store";
import { useLibraryAuthStore } from "@/features/library/auth-store";

export default function LibraryDashboardPage() {
  const { authMode, isStandalone } = useLibrary();
  const portalUser = useAuthStore((s) => s.user);
  const libraryUser = useLibraryAuthStore((s) => s.user);
  const email = libraryUser?.email ?? portalUser?.email;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-stone-900">Parent dashboard</h1>
        <p className="text-stone-600">
          Signed in via <strong>{authMode}</strong>
          {email ? ` (${email})` : ""}. Full stats and recommendations arrive in Phase 7.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.LIBRARY_BROWSE}
          className="rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-300"
        >
          <h2 className="font-medium text-stone-900">Browse content</h2>
          <p className="mt-1 text-sm text-stone-500">Find games and activities for your child.</p>
        </Link>
        <Link
          href={ROUTES.LIBRARY_CHILDREN}
          className="rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-300"
        >
          <h2 className="font-medium text-stone-900">Child profiles</h2>
          <p className="mt-1 text-sm text-stone-500">
            Add or manage children
            {isStandalone ? " for your library account." : " (library account or portal session)."}
          </p>
        </Link>
        <Link
          href={ROUTES.LIBRARY_SETUP_CHILD}
          className="rounded-xl border border-dashed border-stone-300 bg-white/50 p-5 hover:border-stone-400 sm:col-span-2"
        >
          <h2 className="font-medium text-stone-900">Set up a child</h2>
          <p className="mt-1 text-sm text-stone-500">
            Quick wizard: name, birthday, and interest areas.
          </p>
        </Link>
      </div>
    </div>
  );
}
