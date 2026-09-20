"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FEATURE_FLAGS_QUERY_KEY, TENANTS_QUERY_KEY } from "@/constants/query-keys";
import { featureFlagsApi } from "@/lib/feature-flags-api";
import { tenantsApi } from "@/lib/tenants-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSafeErrorMessage } from "@/lib/safe-error";
import type { FeatureFlagItem, TenantFeatureFlagItem } from "@/types/feature-flags";

function isTenantFlag(flag: unknown): flag is TenantFeatureFlagItem {
  return typeof flag === "object" && flag !== null && "effectivelyEnabled" in flag;
}

export function FeatureFlagsManager() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState("");

  const { data: tenantsRes } = useQuery({
    queryKey: [TENANTS_QUERY_KEY, "flag-picker"],
    queryFn: () => tenantsApi.list({ page: 1, limit: 100 }),
  });
  const tenants = tenantsRes?.data?.items ?? [];

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY, "admin", tenantId || "catalog"],
    queryFn: () => featureFlagsApi.list(tenantId ? { tenantId } : undefined),
  });

  const flags = res?.data ?? [];

  const enable = useApiMutation((slug: string) => featureFlagsApi.enable(slug, tenantId), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
      toast({ title: "Feature enabled for tenant", variant: "success" });
    },
    onError: (err) =>
      toast({
        title: "Failed to enable",
        description: getSafeErrorMessage(err),
        variant: "error",
      }),
  });

  const disable = useApiMutation((slug: string) => featureFlagsApi.disable(slug, tenantId), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
      toast({ title: "Feature disabled for tenant", variant: "success" });
    },
    onError: (err) =>
      toast({
        title: "Failed to disable",
        description: getSafeErrorMessage(err),
        variant: "error",
      }),
  });

  const pendingSlug = enable.isPending
    ? (enable.variables as string | undefined)
    : disable.isPending
      ? (disable.variables as string | undefined)
      : undefined;

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <LoadingSkeleton rows={4} className="h-12 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load feature flags" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Tenant</label>
        <Select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="max-w-md">
          <option value="">Catalog only (select a tenant to enable/disable)</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <p className="mt-2 text-xs text-slate-500">
          Flags are product-defined. Pick a tenant, then turn features on or off for that workspace
          only.
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={Flag}
            title="No feature flags yet"
            description="Product flags are added by the team as features ship. Ask a developer to seed them."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {flags.map((flag) => {
            const tenantFlag = isTenantFlag(flag) ? flag : null;
            const enabled = tenantFlag?.effectivelyEnabled ?? false;
            const busy = pendingSlug === flag.slug;
            const canToggle = Boolean(tenantId && tenantFlag);

            return (
              <div key={flag.slug} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{flag.name}</p>
                    {tenantFlag ? (
                      <StatusBadge status={enabled ? "active" : "inactive"} />
                    ) : (
                      <StatusBadge
                        status={(flag as FeatureFlagItem).isActive ? "active" : "inactive"}
                      />
                    )}
                  </div>
                  {flag.description && (
                    <p className="mt-0.5 text-sm text-slate-500">{flag.description}</p>
                  )}
                  <code className="text-xs text-slate-400">{flag.slug}</code>
                </div>

                {canToggle ? (
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={enabled ? `Disable ${flag.name}` : `Enable ${flag.name}`}
                    className="hover:text-primary ml-4 shrink-0 text-slate-400 transition-colors disabled:opacity-40"
                    onClick={() => (enabled ? disable.mutate(flag.slug) : enable.mutate(flag.slug))}
                  >
                    {busy ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : enabled ? (
                      <ToggleRight className="text-primary h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                ) : (
                  <span className="ml-4 shrink-0 text-xs text-slate-400">Select tenant</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
