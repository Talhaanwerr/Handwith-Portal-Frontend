"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { libraryApi } from "@/features/library/api";
import { LibraryContentCard } from "@/features/library/components/LibraryContentCard";
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  DURATION_LABELS,
  TYPE_LABELS,
} from "@/features/library/labels";

const selectClass = "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800";

type SortBy = "createdAt" | "playCount" | "title";

function parseSort(raw: string | null): SortBy {
  if (raw === "playCount" || raw === "title" || raw === "createdAt") return raw;
  return "createdAt";
}

function BrowsePageInner() {
  const searchParams = useSearchParams();
  const sortFromUrl = parseSort(searchParams.get("sort"));

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [tier, setTier] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [tagId, setTagId] = useState("");
  /** Local override after user picks a sort; otherwise follow ?sort= */
  const [sortOverride, setSortOverride] = useState<SortBy | null>(null);
  const [page, setPage] = useState(1);

  const sortBy = sortOverride ?? sortFromUrl;

  const tagsQuery = useQuery({
    queryKey: ["library", "tags", "SKILL_AREA"],
    queryFn: () => libraryApi.tags("SKILL_AREA"),
  });

  const skillTags = tagsQuery.data?.data?.tags ?? [];

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      type: type || undefined,
      tier: tier || undefined,
      ageRange: ageRange || undefined,
      difficulty: difficulty || undefined,
      duration: duration || undefined,
      tagId: tagId || undefined,
      sortBy,
      sortOrder: sortBy === "title" ? "asc" : "desc",
    }),
    [page, search, type, tier, ageRange, difficulty, duration, tagId, sortBy]
  );

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["library", "browse", params],
    queryFn: () => libraryApi.browse(params),
    placeholderData: (prev) => prev,
  });

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;

  function resetFilters() {
    setSearch("");
    setType("");
    setTier("");
    setAgeRange("");
    setDifficulty("");
    setDuration("");
    setTagId("");
    setSortOverride("createdAt");
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-stone-900">Browse</h1>
        <p className="text-stone-600">
          Filter by age, skill, type, and more. Free content plays without an account.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search title or description"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium tracking-wide text-stone-500 uppercase">
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortOverride(e.target.value as SortBy);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="createdAt">Newest</option>
              <option value="playCount">Most played</option>
              <option value="title">Title A–Z</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            value={ageRange}
            onChange={(e) => {
              setAgeRange(e.target.value);
              setPage(1);
            }}
            className={selectClass}
            aria-label="Age range"
          >
            <option value="">All ages</option>
            {Object.entries(AGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className={selectClass}
            aria-label="Difficulty"
          >
            <option value="">All difficulty</option>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setPage(1);
            }}
            className={selectClass}
            aria-label="Duration"
          >
            <option value="">All durations</option>
            {Object.entries(DURATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={tagId}
            onChange={(e) => {
              setTagId(e.target.value);
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

          <select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value);
              setPage(1);
            }}
            className={selectClass}
            aria-label="Free or premium"
          >
            <option value="">Free + Premium</option>
            <option value="FREE">Free only</option>
            <option value="PREMIUM">Premium only</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {isError && <p className="text-sm text-amber-800">Failed to load library content.</p>}
      {!isLoading && items.length === 0 && (
        <p className="text-sm text-stone-500">No content matches these filters.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <LibraryContentCard item={item} />
          </li>
        ))}
      </ul>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
          <p className="text-sm text-stone-500">
            Page {meta.page} of {meta.totalPages}
            {isFetching ? " · updating…" : ""} · {meta.total} items
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

export default function LibraryBrowsePage() {
  return (
    <Suspense fallback={<p className="text-sm text-stone-500">Loading browse…</p>}>
      <BrowsePageInner />
    </Suspense>
  );
}
