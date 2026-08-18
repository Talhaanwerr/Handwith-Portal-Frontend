"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/constants/permissions";
import { FEATURE_FLAGS_QUERY_KEY } from "@/constants/query-keys";
import { featureFlagsApi } from "@/lib/feature-flags-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSafeErrorMessage } from "@/lib/safe-error";
import type { TenantFeatureFlagItem } from "@/types/feature-flags";

function isTenantFlag(flag: unknown): flag is TenantFeatureFlagItem {
  return typeof flag === "object" && flag !== null && "effectivelyEnabled" in flag;
}

export function TenantFeatureFlagsList() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY],
    queryFn: featureFlagsApi.list,
  });

  const flags = (res?.data ?? []).filter(isTenantFlag);

  const enable = useApiMutation((slug: string) => featureFlagsApi.enable(slug), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
      toast({ title: "Feature enabled", variant: "success" });
    },
    onError: (err) =>
      toast({ title: "Failed to enable", description: getSafeErrorMessage(err), variant: "error" }),
  });

  const disable = useApiMutation((slug: string) => featureFlagsApi.disable(slug), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
      toast({ title: "Feature disabled", variant: "success" });
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

  if (flags.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          icon={Flag}
          title="No features available"
          description="Your plan does not include feature flags yet, or none are active."
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {flags.map((flag) => {
        const enabled = flag.effectivelyEnabled;
        const busy = pendingSlug === flag.slug;

        return (
          <div key={flag.slug} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-900">{flag.name}</p>
                <StatusBadge status={enabled ? "active" : "inactive"} />
                {flag.isGlobal && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                    Global
                  </span>
                )}
              </div>
              {flag.description && (
                <p className="mt-0.5 text-sm text-slate-500">{flag.description}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Access:{" "}
                <span className={enabled ? "font-medium text-green-600" : "text-slate-500"}>
                  {enabled ? "Enabled for this workspace" : "Disabled"}
                </span>
                {" · "}
                <code>{flag.slug}</code>
              </p>
            </div>

            <PermissionGuard permission={PERMISSIONS.FEATURE_FLAGS.UPDATE}>
              <button
                type="button"
                disabled={busy || flag.isGlobal}
                title={flag.isGlobal ? "Global flags are managed by the platform" : undefined}
                aria-label={enabled ? `Disable ${flag.name}` : `Enable ${flag.name}`}
                className="hover:text-primary ml-4 shrink-0 text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
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
            </PermissionGuard>
          </div>
        );
      })}
    </div>
  );
}
