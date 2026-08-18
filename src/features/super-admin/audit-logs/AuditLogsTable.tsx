"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { auditLogsApi } from "@/lib/audit-logs-api";
import { AUDIT_LOGS_QUERY_KEY } from "@/constants/query-keys";
import type { AuditLogItem } from "@/types/audit-logs";

export function AuditLogsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, page, search],
    queryFn: () =>
      auditLogsApi.list({
        page,
        limit: 20,
        // The list endpoint doesn't have a full-text search, but we send the
        // search value as "module" filter — refined per product requirements.
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
      render: (r) =>
        r.tenant ? (
          <span className="text-sm">{r.tenant.name}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
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
  ];

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Filter by module…"
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
            description="Actions performed on the platform will appear here."
          />
        }
      />
    </div>
  );
}
