"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "@/features/library/api";
import { LibraryContentCard } from "@/features/library/components/LibraryContentCard";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHILDREN_KEY = ["library", "children"] as const;

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function LibraryDashboardPage() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    void ensureLibraryAccessToken();
  }, []);

  const childrenQuery = useQuery({
    queryKey: CHILDREN_KEY,
    queryFn: () => libraryApi.listChildren(),
  });

  const children = useMemo(
    () => (childrenQuery.data?.data ?? []).filter((c) => c.isActive),
    [childrenQuery.data]
  );

  const activeChildId =
    selectedChildId && children.some((c) => c.id === selectedChildId)
      ? selectedChildId
      : (children[0]?.id ?? null);

  const dashboardQuery = useQuery({
    queryKey: ["library", "dashboard", activeChildId],
    queryFn: () => libraryApi.childDashboard(activeChildId!),
    enabled: Boolean(activeChildId),
  });

  const dash = dashboardQuery.data?.data;

  if (childrenQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Parent dashboard</h1>
        <p className="text-sm text-stone-600">
          Add a child profile first so we can track plays, streaks, and recommendations.
        </p>
        <Link href={ROUTES.LIBRARY_SETUP_CHILD}>
          <Button>Set up a child</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-stone-900">Parent dashboard</h1>
          <p className="text-stone-600">
            Stats and recommendations update when you switch children.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.LIBRARY_HISTORY}>
            <Button variant="outline" size="sm">
              Play history
            </Button>
          </Link>
          <Link href={ROUTES.LIBRARY_CHILDREN}>
            <Button variant="outline" size="sm">
              Manage children
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setSelectedChildId(child.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              activeChildId === child.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
            )}
          >
            {child.name}
          </button>
        ))}
      </div>

      {dashboardQuery.isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-stone-600" />
        </div>
      )}

      {dashboardQuery.isError && (
        <p className="text-sm text-amber-800">Could not load dashboard for this child.</p>
      )}

      {dash && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                Total plays
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{dash.stats.totalPlays}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                Time this week
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">
                {formatDuration(dash.stats.timeThisWeekSecs)}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Streak</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">
                {dash.stats.streakDays} day{dash.stats.streakDays === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {dash.continuePlaying && (
            <section className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900">Continue where you left off</h2>
              <div className="max-w-sm">
                <LibraryContentCard item={dash.continuePlaying.content} />
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-stone-900">
                Recommended for {dash.child.name}
              </h2>
              <Link
                href={ROUTES.LIBRARY_BROWSE}
                className="text-sm text-stone-500 hover:text-stone-800"
              >
                Browse all
              </Link>
            </div>
            {dash.recommended.length === 0 ? (
              <p className="text-sm text-stone-500">
                No recommendations yet — try browsing the library.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dash.recommended.map((item) => (
                  <li key={item.id}>
                    <LibraryContentCard item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-stone-900">Recently played</h2>
              <Link
                href={`${ROUTES.LIBRARY_HISTORY}?childId=${dash.child.id}`}
                className="text-sm text-stone-500 hover:text-stone-800"
              >
                View all
              </Link>
            </div>
            {dash.recentlyPlayed.length === 0 ? (
              <p className="text-sm text-stone-500">No plays yet for this child.</p>
            ) : (
              <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
                {dash.recentlyPlayed.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`${ROUTES.LIBRARY_GAME}/${row.content.id}`}
                        className="truncate font-medium text-stone-900 hover:underline"
                      >
                        {row.content.title}
                      </Link>
                      <p className="text-xs text-stone-500">
                        {new Date(row.playedAt).toLocaleString()}
                        {row.durationSecs != null ? ` · ${formatDuration(row.durationSecs)}` : ""}
                        {row.completionPct != null ? ` · ${row.completionPct}%` : ""}
                      </p>
                    </div>
                    <Link href={`${ROUTES.LIBRARY_GAME}/${row.content.id}`}>
                      <Button variant="outline" size="sm">
                        Play again
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
