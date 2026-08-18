"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flag, Loader2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { FormModal } from "@/components/ui/form-modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { FEATURE_FLAGS_QUERY_KEY } from "@/constants/query-keys";
import { featureFlagsApi } from "@/lib/feature-flags-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSafeErrorMessage } from "@/lib/safe-error";
import type { FeatureFlagItem } from "@/types/feature-flags";

const createSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  isGlobal: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
type CreateValues = z.infer<typeof createSchema>;

export function FeatureFlagsManager() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY, "admin"],
    queryFn: featureFlagsApi.list,
  });

  const flags = (res?.data ?? []) as FeatureFlagItem[];

  const create = useApiMutation(featureFlagsApi.create, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
      setCreateOpen(false);
      toast({ title: "Feature flag created", variant: "success" });
    },
    onError: (err) =>
      toast({ title: "Create failed", description: getSafeErrorMessage(err), variant: "error" }),
  });

  const toggleActive = useApiMutation(
    ({ slug, isActive }: { slug: string; isActive: boolean }) =>
      featureFlagsApi.update(slug, { isActive }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
        toast({ title: "Flag updated", variant: "success" });
      },
      onError: (err) =>
        toast({ title: "Update failed", description: getSafeErrorMessage(err), variant: "error" }),
    }
  );

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", slug: "", description: "", isGlobal: false, isActive: true },
  });

  async function onCreate(data: CreateValues) {
    await create.mutateAsync({
      name: data.name,
      slug: data.slug,
      description: data.description,
      isGlobal: data.isGlobal ?? false,
      isActive: data.isActive ?? true,
    });
    form.reset();
  }

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
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Flag
        </Button>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={Flag}
            title="No feature flags yet"
            description="Create platform-wide feature flags to control rollout."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {flags.map((flag) => {
            const busy =
              toggleActive.isPending &&
              (toggleActive.variables as { slug: string } | undefined)?.slug === flag.slug;

            return (
              <div key={flag.slug} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{flag.name}</p>
                    <StatusBadge status={flag.isActive ? "active" : "inactive"} />
                    {flag.isGlobal && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                        Global
                      </span>
                    )}
                  </div>
                  {flag.description && (
                    <p className="mt-0.5 text-sm text-slate-500">{flag.description}</p>
                  )}
                  <code className="text-xs text-slate-400">{flag.slug}</code>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  aria-label={flag.isActive ? "Deactivate flag" : "Activate flag"}
                  className="hover:text-primary ml-4 shrink-0 text-slate-400 transition-colors disabled:opacity-40"
                  onClick={() => toggleActive.mutate({ slug: flag.slug, isActive: !flag.isActive })}
                >
                  {busy ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : flag.isActive ? (
                    <ToggleRight className="text-primary h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Feature Flag"
        description="Platform-wide flag. Tenants can override non-global flags."
        formId="create-flag-form"
        submitLabel="Create"
        isSubmitting={create.isPending}
      >
        <form id="create-flag-form" className="space-y-4" onSubmit={form.handleSubmit(onCreate)}>
          <FormField label="Name" error={form.formState.errors.name?.message} required>
            <Input placeholder="Advanced Reports" {...form.register("name")} />
          </FormField>
          <FormField label="Slug" error={form.formState.errors.slug?.message} required>
            <Input placeholder="advanced-reports" {...form.register("slug")} />
          </FormField>
          <FormField label="Description" error={form.formState.errors.description?.message}>
            <Input placeholder="Optional description" {...form.register("description")} />
          </FormField>
          <Checkbox label="Global (always on for all tenants)" {...form.register("isGlobal")} />
        </form>
      </FormModal>
    </div>
  );
}
