"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, ChartColumn } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSafeErrorMessage } from "@/lib/safe-error";
import { adminLibraryApi, type AdminContentItem } from "@/lib/admin-library-api";
import { TYPE_LABELS, AGE_LABELS, DIFFICULTY_LABELS } from "@/features/library/labels";
import { GameCard } from "@/features/super-admin/library/GameCard";
import { GAMES } from "@/constants/games";
import { GAME_SCENE_ICONS } from "@shared/components/icons/GameSceneIcons";
import { LIBRARY_CONTENT_QUERY_KEY } from "@/constants/query-keys";
import { cn } from "@/lib/utils";

export function ContentLibraryAdmin() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [tier, setTier] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "playCount" | "title">("createdAt");
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTier, setBulkTier] = useState("");
  const [bulkDifficulty, setBulkDifficulty] = useState("");
  const [bulkAge, setBulkAge] = useState("");
  const [bulkTagIds, setBulkTagIds] = useState<string[]>([]);
  const [showPlaylab, setShowPlaylab] = useState(false);

  const listQuery = useQuery({
    queryKey: [LIBRARY_CONTENT_QUERY_KEY, page, search, type, tier, sortBy, includeInactive],
    queryFn: () =>
      adminLibraryApi.listContent({
        page,
        limit: 15,
        search: search || undefined,
        type: type || undefined,
        tier: tier || undefined,
        sortBy,
        sortOrder: sortBy === "title" ? "asc" : "desc",
        includeInactive,
      }),
    placeholderData: (prev) => prev,
  });

  const tagsQuery = useQuery({
    queryKey: ["library-admin-tags", "SKILL_AREA"],
    queryFn: () => adminLibraryApi.listTags("SKILL_AREA"),
  });

  const items = listQuery.data?.data?.items ?? [];
  const meta = listQuery.data?.data?.meta;
  const skillTags = tagsQuery.data?.data?.tags ?? [];

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(items.map((i) => i.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const toggleActive = useApiMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminLibraryApi.updateContent(id, { isActive }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [LIBRARY_CONTENT_QUERY_KEY] });
        toast({ title: "Status updated", variant: "success" });
      },
      onError: (err) =>
        toast({ title: "Update failed", description: getSafeErrorMessage(err), variant: "error" }),
    }
  );

  const bulk = useApiMutation(adminLibraryApi.bulkUpdate, {
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [LIBRARY_CONTENT_QUERY_KEY] });
      setSelected(new Set());
      setBulkTagIds([]);
      setBulkTier("");
      setBulkDifficulty("");
      setBulkAge("");
      toast({
        title: "Bulk update applied",
        description: `Updated ${res.data?.updated ?? 0} item(s).`,
        variant: "success",
      });
    },
    onError: (err) =>
      toast({
        title: "Bulk update failed",
        description: getSafeErrorMessage(err),
        variant: "error",
      }),
  });

  const selectedCount = selected.size;
  const shelf = useMemo(() => GAMES.filter((g) => !g.hidden), []);

  async function applyBulk() {
    if (selectedCount === 0) return;
    await bulk.mutateAsync({
      contentItemIds: [...selected],
      tagIds: bulkTagIds.length ? bulkTagIds : undefined,
      tier: bulkTier || undefined,
      difficulty: bulkDifficulty || undefined,
      ageRange: bulkAge || undefined,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Library"
        description="Upload and manage library content, tags, and parent subscriptions."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/super-admin/library/analytics">
              <Button variant="outline">
                <ChartColumn className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/super-admin/library/users">
              <Button variant="outline">
                <Users className="h-4 w-4" />
                Library parents
              </Button>
            </Link>
            <Link href="/super-admin/library/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add content
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          placeholder="Search title…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-36"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value);
              setPage(1);
            }}
            className="w-32"
          >
            <option value="">All tiers</option>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-36"
          >
            <option value="createdAt">Newest</option>
            <option value="playCount">Most played</option>
            <option value="title">Title</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => {
                setIncludeInactive(e.target.checked);
                setPage(1);
              }}
            />
            Include inactive
          </label>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <p className="text-sm font-medium text-slate-800">{selectedCount} selected — bulk edit</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={bulkTier} onChange={(e) => setBulkTier(e.target.value)}>
              <option value="">Keep tier</option>
              <option value="FREE">Set Free</option>
              <option value="PREMIUM">Set Premium</option>
            </Select>
            <Select value={bulkDifficulty} onChange={(e) => setBulkDifficulty(e.target.value)}>
              <option value="">Keep difficulty</option>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select value={bulkAge} onChange={(e) => setBulkAge(e.target.value)}>
              <option value="">Keep age range</option>
              {Object.entries(AGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                setBulkTagIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
              }}
            >
              <option value="">Add skill tag…</option>
              {skillTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          {bulkTagIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bulkTagIds.map((id) => {
                const tag = skillTags.find((t) => t.id === id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs"
                    onClick={() => setBulkTagIds((prev) => prev.filter((x) => x !== id))}
                  >
                    {tag?.label ?? id} ×
                  </button>
                );
              })}
            </div>
          )}
          <Button type="button" onClick={applyBulk} disabled={bulk.isPending}>
            Apply to selected
          </Button>
        </div>
      )}

      {listQuery.isLoading && <LoadingSkeleton className="h-48 w-full" />}
      {listQuery.isError && (
        <ErrorState title="Failed to load content" onRetry={() => listQuery.refetch()} />
      )}
      {!listQuery.isLoading && items.length === 0 && (
        <EmptyState
          title="No content yet"
          description="Create your first library item to appear in public browse."
        />
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="px-3 py-3">Content</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Tier</th>
                <th className="px-3 py-3">Plays</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row) => (
                <ContentRow
                  key={row.id}
                  row={row}
                  checked={selected.has(row.id)}
                  onToggle={() => toggleOne(row.id)}
                  onOpen={() => router.push(`/super-admin/library/${row.id}`)}
                  onToggleActive={() =>
                    toggleActive.mutate({ id: row.id, isActive: !row.isActive })
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
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

      <div className="border-t border-slate-200 pt-6">
        <button
          type="button"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
          onClick={() => setShowPlaylab((v) => !v)}
        >
          {showPlaylab ? "Hide" : "Show"} PlayLab game shelf ({shelf.length})
        </button>
        {showPlaylab && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {shelf.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentRow({
  row,
  checked,
  onToggle,
  onOpen,
  onToggleActive,
}: {
  row: AdminContentItem;
  checked: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onToggleActive: () => void;
}) {
  const gameMeta =
    row.type === "GAME" && row.fileId ? GAMES.find((g) => g.id === row.fileId) : undefined;
  const SceneIcon =
    row.fileId && GAME_SCENE_ICONS[row.fileId] ? GAME_SCENE_ICONS[row.fileId] : null;

  return (
    <tr className={cn("hover:bg-slate-50", !row.isActive && "opacity-60")}>
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-3">
        <button type="button" onClick={onOpen} className="flex items-center gap-3 text-left">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100"
            style={
              !row.thumbnailUrl && gameMeta ? { backgroundColor: gameMeta.colors.bg } : undefined
            }
          >
            {row.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : SceneIcon ? (
              <div className="h-7 w-7" aria-hidden>
                <SceneIcon />
              </div>
            ) : gameMeta ? (
              <span className="text-lg" aria-hidden>
                {gameMeta.glyph}
              </span>
            ) : null}
          </div>
          <span className="font-medium text-slate-900 hover:underline">{row.title}</span>
        </button>
      </td>
      <td className="px-3 py-3 text-slate-600">{TYPE_LABELS[row.type] ?? row.type}</td>
      <td className="px-3 py-3">
        <StatusBadge status={row.tier.toLowerCase()} />
      </td>
      <td className="px-3 py-3 text-slate-600">{row.playCount}</td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={onToggleActive}
          className="text-xs font-medium text-slate-600 underline"
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-3 py-3 text-xs text-slate-500">
        {new Date(row.createdAt).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-right">
        <Button variant="outline" size="sm" onClick={onOpen}>
          Edit
        </Button>
      </td>
    </tr>
  );
}
