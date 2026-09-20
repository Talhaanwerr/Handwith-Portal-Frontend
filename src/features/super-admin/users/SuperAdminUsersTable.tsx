"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Loader2, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usersApi } from "@/lib/users-api";
import { USERS_QUERY_KEY } from "@/constants/query-keys";
import { useTablePageSize } from "@/hooks/use-table-page-size";
import { useToast } from "@/components/ui/toast";
import { getSafeErrorMessage } from "@/lib/safe-error";
import { useAuthStore } from "@/store/auth-store";
import type { UserListItem } from "@/types/users";

export function SuperAdminUsersTable() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = useTablePageSize();

  const { data, isLoading } = useQuery({
    queryKey: [USERS_QUERY_KEY, { search, page, pageSize }],
    queryFn: () => usersApi.list({ search: search || undefined, page, limit: pageSize }),
    placeholderData: (prev) => prev,
  });

  const users = data?.data?.items ?? [];
  const total = data?.data?.meta.total ?? 0;
  const totalPages = data?.data?.meta.totalPages ?? 1;
  const pendingDelete = users.find((u) => u.id === deleteId);

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await usersApi.softDelete(deleteId);
      toast({ title: "User deleted", variant: "success" });
      await qc.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      setDeleteId(null);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: getSafeErrorMessage(err),
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

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
      key: "tenants",
      header: "Tenants & Roles",
      render: (r) => {
        if (r.isSuperAdmin) {
          return <span className="text-primary text-xs font-semibold">SUPER ADMIN</span>;
        }
        const tenants = r.tenants ?? [];
        if (tenants.length === 0) {
          return <span className="text-xs text-amber-600">No tenant</span>;
        }
        return (
          <div className="space-y-1.5">
            {tenants.map((t) => (
              <div key={t.id} className="text-xs">
                <p className="font-medium text-slate-800">{t.name}</p>
                <p className="text-slate-500">
                  {t.roles.length > 0 ? t.roles.map((role) => role.name).join(", ") : "No role"}
                </p>
              </div>
            ))}
          </div>
        );
      },
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
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.id === currentUserId ? null : (
          <button
            type="button"
            aria-label={`Delete ${r.email}`}
            className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
    },
  ];

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

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete user"
        description={
          pendingDelete
            ? `Soft-delete ${pendingDelete.email}? They will disappear from this list. Orphan accounts with no tenant can be cleaned up this way.`
            : "Soft-delete this user?"
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleting}
      />
    </div>
  );
}
