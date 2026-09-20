"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, AlertTriangle, Activity, TrendingUp, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { tenantsApi } from "@/lib/tenants-api";
import { auditLogsApi } from "@/lib/audit-logs-api";
import { TENANTS_QUERY_KEY, AUDIT_LOGS_QUERY_KEY } from "@/constants/query-keys";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SuperAdminDashboard() {
  const statsQuery = useQuery({
    queryKey: [TENANTS_QUERY_KEY, "stats"],
    queryFn: () => tenantsApi.getStats(),
  });

  const logsQuery = useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, "dashboard-recent"],
    queryFn: () => auditLogsApi.list({ page: 1, limit: 8 }),
  });

  const stats = statsQuery.data?.data;
  const logs = logsQuery.data?.data?.items ?? [];

  const cards = [
    {
      label: "Total Tenants",
      value: stats?.totalTenants ?? 0,
      icon: Building2,
      iconClass: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Tenants",
      value: stats?.activeTenants ?? 0,
      icon: Activity,
      iconClass: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Pending Tenants",
      value: stats?.pendingTenants ?? 0,
      icon: Clock,
      iconClass: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      label: "Suspended",
      value: stats?.suspendedTenants ?? 0,
      icon: AlertTriangle,
      iconClass: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconClass: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth ?? 0,
      icon: TrendingUp,
      iconClass: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Platform-wide overview and management"
        action={
          <Link
            href="/super-admin/tenants/create"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
          >
            + New Tenant
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={statsQuery.isLoading ? "…" : String(s.value)}
            icon={s.icon}
            iconClassName={`${s.iconClass} [&>svg]:${s.iconColor}`}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Audit Logs</h2>
          <Link href="/super-admin/audit-logs" className="text-primary text-xs hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {logsQuery.isLoading && (
            <p className="px-5 py-6 text-sm text-slate-500">Loading recent activity…</p>
          )}
          {!logsQuery.isLoading && logs.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500">No audit logs yet.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {log.module} · {log.action}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {log.actorEmail ?? log.actorName ?? "System"}
                  {log.tenant?.name ? ` · ${log.tenant.name}` : ""}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <StatusBadge status={log.action.toLowerCase()} />
                <span className="text-xs text-slate-400">{formatRelativeTime(log.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
