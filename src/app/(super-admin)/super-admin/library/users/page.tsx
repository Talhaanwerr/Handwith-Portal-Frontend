"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { adminLibraryApi, type LibraryParentListItem } from "@/lib/admin-library-api";
import { LIBRARY_PARENTS_QUERY_KEY } from "@/constants/query-keys";

export default function LibraryParentsPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [LIBRARY_PARENTS_QUERY_KEY, page, search, tier],
    queryFn: () =>
      adminLibraryApi.listUsers({
        page,
        limit: 15,
        search: search || undefined,
        tier: tier || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const detailQuery = useQuery({
    queryKey: [LIBRARY_PARENTS_QUERY_KEY, "detail", selectedId],
    queryFn: () => adminLibraryApi.getUser(selectedId!),
    enabled: Boolean(selectedId),
  });

  const items = listQuery.data?.data?.items ?? [];
  const meta = listQuery.data?.data?.meta;
  const detail = detailQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library parents"
        description="Search parent accounts, review children/history, and manually set Free or Premium."
        action={
          <Link href="/super-admin/library" className="text-sm text-slate-500 hover:text-slate-800">
            ← Content library
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search email or name…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <Select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All tiers</option>
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          {listQuery.isLoading && <LoadingSkeleton className="h-48 w-full" />}
          {listQuery.isError && (
            <ErrorState title="Failed to load parents" onRetry={() => listQuery.refetch()} />
          )}
          {!listQuery.isLoading && items.length === 0 && (
            <EmptyState
              title="No library parents"
              description="Parents appear after registration."
            />
          )}
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {items.map((row) => (
              <ParentRow
                key={row.id}
                row={row}
                active={selectedId === row.id}
                onSelect={() => setSelectedId(row.id)}
              />
            ))}
          </ul>
          {meta && meta.totalPages > 1 && (
            <div className="mt-3 flex justify-between">
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
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedId && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Select a parent to view children, recent plays, and change subscription tier.
            </div>
          )}
          {selectedId && detailQuery.isLoading && <LoadingSkeleton className="h-64 w-full" />}
          {selectedId && detailQuery.isError && (
            <ErrorState title="Failed to load parent" onRetry={() => detailQuery.refetch()} />
          )}
          {detail && <ParentDetailPanel detail={detail} />}
        </div>
      </div>
    </div>
  );
}

function ParentRow({
  row,
  active,
  onSelect,
}: {
  row: LibraryParentListItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-50 ${
          active ? "bg-slate-50" : ""
        }`}
      >
        <span className="font-medium text-slate-900">
          {row.firstName} {row.lastName}
        </span>
        <span className="text-xs text-slate-500">{row.email}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={row.tier.toLowerCase()} />
          <span className="text-xs text-slate-400">{row.childCount} child(ren)</span>
        </div>
      </button>
    </li>
  );
}

function ParentDetailPanel({
  detail,
}: {
  detail: NonNullable<Awaited<ReturnType<typeof adminLibraryApi.getUser>>["data"]>;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const updateTier = useApiMutation(
    (tier: "FREE" | "PREMIUM") => adminLibraryApi.updateSubscription(detail.id, tier),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [LIBRARY_PARENTS_QUERY_KEY] });
        toast({ title: "Subscription updated", variant: "success" });
      },
      onError: (err) =>
        toast({
          title: "Could not update tier",
          description: getSafeErrorMessage(err),
          variant: "error",
        }),
    }
  );

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {detail.firstName} {detail.lastName}
          </h2>
          <p className="text-sm text-slate-500">{detail.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            Joined {new Date(detail.createdAt).toLocaleDateString()} ·{" "}
            {detail.emailVerified ? "Email verified" : "Email not verified"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={detail.tier.toLowerCase()} />
          {detail.tier === "FREE" ? (
            <Button
              size="sm"
              onClick={() => updateTier.mutate("PREMIUM")}
              disabled={updateTier.isPending}
            >
              Upgrade to Premium
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTier.mutate("FREE")}
              disabled={updateTier.isPending}
            >
              Downgrade to Free
            </Button>
          )}
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Children</h3>
        {detail.children.length === 0 ? (
          <p className="text-sm text-slate-500">No child profiles.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {detail.children.map((c) => (
              <li key={c.id} className="px-3 py-2 text-sm">
                <span className="font-medium text-slate-900">{c.name}</span>
                <span className="text-slate-500">
                  {" "}
                  · {c.sessionCount} sessions
                  {!c.isActive ? " · inactive" : ""}
                  {c.therapyChildId ? " · therapy-linked" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Recent plays</h3>
        {detail.recentSessions.length === 0 ? (
          <p className="text-sm text-slate-500">No completed sessions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {detail.recentSessions.map((s) => (
              <li key={s.id} className="px-3 py-2 text-sm">
                <span className="font-medium text-slate-900">{s.content.title}</span>
                <span className="text-slate-500">
                  {" "}
                  · {s.child.name} · {new Date(s.playedAt).toLocaleString()}
                  {s.completionPct != null ? ` · ${s.completionPct}%` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
