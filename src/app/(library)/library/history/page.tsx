"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "@/features/library/api";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { TYPE_LABELS } from "@/features/library/labels";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const selectClass = "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800";

function formatDuration(secs: number | null): string {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function HistoryInner() {
  const searchParams = useSearchParams();
  const initialChild = searchParams.get("childId");

  const [childId, setChildId] = useState<string | null>(initialChild);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [skillTagId, setSkillTagId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    void ensureLibraryAccessToken();
  }, []);

  const childrenQuery = useQuery({
    queryKey: ["library", "children"],
    queryFn: () => libraryApi.listChildren(),
  });

  const children = useMemo(
    () => (childrenQuery.data?.data ?? []).filter((c) => c.isActive),
    [childrenQuery.data]
  );

  const activeChildId =
    childId && children.some((c) => c.id === childId) ? childId : (children[0]?.id ?? null);

  const tagsQuery = useQuery({
    queryKey: ["library", "tags", "SKILL_AREA"],
    queryFn: () => libraryApi.tags("SKILL_AREA"),
  });
  const skillTags = tagsQuery.data?.data?.tags ?? [];

  const historyQuery = useQuery({
    queryKey: ["library", "history", activeChildId, page, type, skillTagId, from, to],
    queryFn: () =>
      libraryApi.childHistory(activeChildId!, {
        page,
        limit: 15,
        type: type || undefined,
        skillTagId: skillTagId || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    enabled: Boolean(activeChildId),
  });

  const history = historyQuery.data?.data;
  const items = history?.items ?? [];
  const meta = history?.meta;

  if (childrenQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
        <p className="text-sm text-stone-600">Add a child profile to see play history.</p>
        <Link href={ROUTES.LIBRARY_SETUP_CHILD} className="mt-3 inline-block text-sm underline">
          Set up a child
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-stone-900">Play history</h1>
        <p className="text-stone-600">Chronological plays per child, with filters.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => {
              setChildId(child.id);
              setPage(1);
            }}
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

      <div className="grid gap-2 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Content type"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={skillTagId}
          onChange={(e) => {
            setSkillTagId(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Skill area"
        >
          <option value="">All skills</option>
          {skillTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="To date"
        />
      </div>

      {history?.truncated && history.upgradeHint && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {history.upgradeHint}
        </div>
      )}

      {historyQuery.isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-stone-600" />
        </div>
      )}

      {historyQuery.isError && <p className="text-sm text-amber-800">Could not load history.</p>}

      {!historyQuery.isLoading && items.length === 0 && (
        <p className="text-sm text-stone-500">No plays match these filters.</p>
      )}

      <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {items.map((row) => {
          const skillLabels = row.content.tags
            .filter((t) => t.category === "SKILL_AREA")
            .map((t) => t.label);
          return (
            <li key={row.id} className="px-4 py-3.5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`${ROUTES.LIBRARY_GAME}/${row.content.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {row.content.title}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {new Date(row.playedAt).toLocaleString()} ·{" "}
                    {TYPE_LABELS[row.content.type] ?? row.content.type}
                    {skillLabels.length > 0 ? ` · ${skillLabels.join(", ")}` : ""}
                  </p>
                </div>
                <dl className="flex flex-wrap gap-3 text-xs text-stone-600">
                  <div>
                    <dt className="text-stone-400">Duration</dt>
                    <dd className="font-medium">{formatDuration(row.durationSecs)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Score</dt>
                    <dd className="font-medium">{row.score ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Done</dt>
                    <dd className="font-medium">
                      {row.completionPct != null ? `${row.completionPct}%` : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ul>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} plays
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
        </div>
      }
    >
      <HistoryInner />
    </Suspense>
  );
}
