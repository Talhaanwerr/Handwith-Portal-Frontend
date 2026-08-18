"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { usersApi } from "@/lib/users-api";
import { USERS_QUERY_KEY } from "@/constants/query-keys";
import type { UserListItem } from "@/types/users";

const columns: Column<UserListItem>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (r) => (
      <div>
        <p className="font-medium text-slate-900">
          {r.firstName} {r.lastName}
        </p>
        <p className="text-xs text-slate-400">{r.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (r) =>
      r.isSuperAdmin ? (
        <span className="text-primary text-xs font-semibold">SUPER ADMIN</span>
      ) : (
        <span className="text-xs text-slate-500">Tenant User</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "createdAt",
    header: "Joined",
    render: (r) => (
      <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
    ),
  },
];

export function SuperAdminUsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [USERS_QUERY_KEY, { search, page }],
    queryFn: () => usersApi.list({ search: search || undefined, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const users = data?.data?.items ?? [];
  const total = data?.data?.meta.total ?? 0;
  const totalPages = data?.data?.meta.totalPages ?? 1;

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <SearchInput placeholder="Search users…" value={search} onChange={handleSearchChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          emptyState={<EmptyState icon={Users} title="No users found" />}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total} users</span>
          <div className="flex gap-2">
            <button
              className="rounded border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="px-2 py-1.5 text-xs">
              {page} / {totalPages}
            </span>
            <button
              className="rounded border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
