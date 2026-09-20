"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { AuditLogDetailDialog } from "@/components/ui/audit-log-detail-dialog";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { useTablePageSize } from "@/hooks/use-table-page-size";
import { AUDIT_LOGS_QUERY_KEY } from "@/constants/query-keys";
import type { AuditLogItem } from "@/types/audit-logs";

const MODULE_OPTIONS = [
  { value: "", label: "All Modules" },
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "settings", label: "Settings" },
  { value: "files", label: "Files" },
  { value: "notifications", label: "Notifications" },
];

export function ActivityLogsTable() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AuditLogItem | null>(null);
  const pageSize = useTablePageSize();

  const { data: res, isLoading } = usePaginatedQuery<AuditLogItem>({
    queryKey: [AUDIT_LOGS_QUERY_KEY, "tenant", page, pageSize, moduleFilter, search],
    path: "/audit-logs",
    params: {
      page,
      limit: pageSize,
      module: moduleFilter || undefined,
      search: search || undefined,
    },
    placeholderData: (prev) => prev,
  });

  const items = res?.data?.items ?? [];
  const totalPages = res?.data?.meta.totalPages ?? 1;

  const columns: Column<AuditLogItem>[] = [
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
          {r.module}:{r.action}
        </code>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (r) =>
        r.entityId ? (
          <span className="text-sm text-slate-600">
            {r.module} <span className="text-xs text-slate-400">#{r.entityId.slice(0, 8)}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "actor",
      header: "Performed By",
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-slate-800">
            {r.actorName ?? r.actorEmail ?? "System"}
          </p>
          {r.actorEmail && r.actorName && <p className="text-xs text-slate-400">{r.actorEmail}</p>}
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (r) => (
        <span className="text-xs whitespace-nowrap text-slate-400">
          {new Date(r.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "detail",
      header: "Details",
      render: (r) => (
        <button
          type="button"
          aria-label="View log details"
          className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setDetail(r)}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search by action or actor…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          className="w-44"
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
        >
          {MODULE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
            illustration="logs"
            title="No activity yet"
            description="Actions performed in your workspace will appear here."
          />
        }
      />
      <AuditLogDetailDialog log={detail} open={Boolean(detail)} onClose={() => setDetail(null)} />
    </div>
  );
}
