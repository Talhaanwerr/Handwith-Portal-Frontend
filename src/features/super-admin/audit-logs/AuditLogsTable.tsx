"use client";

import { useState } from "react";
import { ScrollText, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { AuditLogDetailDialog } from "@/components/ui/audit-log-detail-dialog";
import { auditLogsApi } from "@/lib/audit-logs-api";
import { AUDIT_LOGS_QUERY_KEY } from "@/constants/query-keys";
import { useTablePageSize } from "@/hooks/use-table-page-size";
import type { AuditLogItem } from "@/types/audit-logs";

export function AuditLogsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AuditLogItem | null>(null);
  const pageSize = useTablePageSize();

  const { data: res, isLoading } = useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, page, pageSize, search],
    queryFn: () =>
      auditLogsApi.list({
        page,
        limit: pageSize,
        module: search || undefined,
      }),
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
          <span className="text-sm">
            {r.module} <span className="text-xs text-slate-400">#{r.entityId.slice(0, 8)}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "actor",
      header: "Actor",
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
      key: "tenant",
      header: "Tenant",
      render: (r) => {
        const fromValue =
          typeof r.newValue === "object" && r.newValue && "tenantName" in r.newValue
            ? String((r.newValue as { tenantName?: string }).tenantName ?? "")
            : "";
        const name = r.tenant?.name || fromValue;
        return name ? (
          <span className="text-sm">{name}</span>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: "ip",
      header: "IP",
      render: (r) => <span className="text-xs text-slate-400">{r.ipAddress ?? "—"}</span>,
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
      header: "",
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
      <SearchInput
        placeholder="Filter by module (e.g. te for tenants)…"
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={ScrollText}
            title="No audit logs yet"
            description="Platform and Super Admin actions will appear here."
          />
        }
      />
      <AuditLogDetailDialog log={detail} open={Boolean(detail)} onClose={() => setDetail(null)} />
    </div>
  );
}
