"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { tenantsApi } from "@/lib/tenants-api";
import { TENANTS_QUERY_KEY } from "@/constants/query-keys";
import { useTablePageSize } from "@/hooks/use-table-page-size";
import type { TenantListItem } from "@/types/tenants";

const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "PENDING", label: "PENDING" },
  { value: "SUSPENDED", label: "SUSPENDED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export function TenantsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = useTablePageSize();

  const { data: res, isLoading } = useQuery({
    queryKey: [TENANTS_QUERY_KEY, page, pageSize, search, statusFilter],
    queryFn: () =>
      tenantsApi.list({
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
      }),
    placeholderData: (prev) => prev,
  });

  const items = res?.data?.items ?? [];
  const totalPages = res?.data?.meta.totalPages ?? 1;

  const columns: Column<TenantListItem>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => (
        <Link
          href={`/super-admin/tenants/${row.id}`}
          className="text-primary font-medium hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (row) => <code className="text-xs">{row.slug}</code>,
    },
    {
      key: "subdomain",
      header: "Subdomain",
      render: (row) => <span className="text-sm text-slate-500">{row.subdomain ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "currency",
      header: "Currency",
      render: (row) => <span className="text-sm text-slate-500">{row.currency}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-16 text-right",
      render: (row) => (
        <Link href={`/super-admin/tenants/${row.id}`}>
          <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <Eye className="h-4 w-4" />
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search tenants…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Select
          className="sm:w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Building2}
            title="No tenants yet"
            description="Create your first tenant to get started."
          />
        }
      />
    </div>
  );
}
