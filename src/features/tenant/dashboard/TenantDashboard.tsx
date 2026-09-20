"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, ShieldCheck, Activity, Flag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { usersApi } from "@/lib/users-api";
import { rolesApi } from "@/lib/roles-api";
import { auditLogsApi } from "@/lib/audit-logs-api";
import { featureFlagsApi } from "@/lib/feature-flags-api";
import {
  USERS_QUERY_KEY,
  ROLES_QUERY_KEY,
  AUDIT_LOGS_QUERY_KEY,
  FEATURE_FLAGS_QUERY_KEY,
} from "@/constants/query-keys";
import type { TenantFeatureFlagItem } from "@/types/feature-flags";

function isTenantFlag(flag: unknown): flag is TenantFeatureFlagItem {
  return typeof flag === "object" && flag !== null && "effectivelyEnabled" in flag;
}

export function TenantDashboard() {
  const usersQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, "dashboard-count"],
    queryFn: () => usersApi.list({ page: 1, limit: 1 }),
  });

  const rolesQuery = useQuery({
    queryKey: [ROLES_QUERY_KEY, "dashboard-count"],
    queryFn: () => rolesApi.list(),
  });

  const activityQuery = useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, "dashboard-count"],
    queryFn: () => auditLogsApi.list({ page: 1, limit: 1 }),
  });

  const flagsQuery = useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY, "dashboard-count"],
    queryFn: () => featureFlagsApi.list(),
  });

  const totalUsers = usersQuery.data?.data?.meta?.total;
  const activeRoles = rolesQuery.data?.data?.length;
  const activityTotal = activityQuery.data?.data?.meta?.total;
  const enabledFlags = (flagsQuery.data?.data ?? [])
    .filter(isTenantFlag)
    .filter((f) => f.effectivelyEnabled).length;

  const cards = [
    {
      label: "Total Users",
      value: totalUsers,
      loading: usersQuery.isLoading,
      error: usersQuery.isError,
      href: "/users",
      icon: Users,
    },
    {
      label: "Active Roles",
      value: activeRoles,
      loading: rolesQuery.isLoading,
      error: rolesQuery.isError,
      href: "/roles",
      icon: ShieldCheck,
    },
    {
      label: "Activity Logs",
      value: activityTotal,
      loading: activityQuery.isLoading,
      error: activityQuery.isError,
      href: "/activity-logs",
      icon: Activity,
    },
    {
      label: "Features Enabled",
      value: flagsQuery.isSuccess ? enabledFlags : undefined,
      loading: flagsQuery.isLoading,
      error: flagsQuery.isError,
      href: "/feature-flags",
      icon: Flag,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Welcome to your workspace" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => {
          const display = s.loading ? "…" : s.error ? "—" : String(s.value ?? 0);
          return (
            <Link key={s.label} href={s.href} className="block transition hover:opacity-90">
              <StatCard label={s.label} value={display} icon={s.icon} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
