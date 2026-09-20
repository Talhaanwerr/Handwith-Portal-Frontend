"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ApiError } from "@/lib/api-error";
import { settingsApi } from "@/lib/settings-api";
import { PLATFORM_SETTINGS_QUERY_KEY } from "@/constants/query-keys";
import {
  TABLE_PAGE_SIZE_MAX,
  TABLE_PAGE_SIZE_MIN,
  readTablePageSize,
  writeTablePageSize,
} from "@/lib/table-page-size";

const schema = z.object({
  appName: z.string().min(1, "App name is required").max(100),
  supportEmail: z.string().email("Enter a valid email"),
  defaultTimezone: z.literal("Asia/Karachi"),
  defaultCurrency: z.enum(["PKR", "USD"]),
  tablePageSize: z
    .number({ message: "Enter a number" })
    .int("Must be a whole number")
    .min(TABLE_PAGE_SIZE_MIN, `Minimum is ${TABLE_PAGE_SIZE_MIN}`)
    .max(TABLE_PAGE_SIZE_MAX, `Maximum is ${TABLE_PAGE_SIZE_MAX}`),
});

type FormValues = z.infer<typeof schema>;

export function SuperAdminSettingsForm() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [PLATFORM_SETTINGS_QUERY_KEY],
    queryFn: () => settingsApi.getPlatform(),
  });

  const platform = res?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      appName: "Handwith Portal",
      supportEmail: "support@handwith.com",
      defaultTimezone: "Asia/Karachi",
      defaultCurrency: "PKR",
      tablePageSize: 10,
    },
  });

  useEffect(() => {
    if (!platform) return;
    reset({
      appName: platform.appName,
      supportEmail: platform.supportEmail,
      defaultTimezone: "Asia/Karachi",
      defaultCurrency:
        platform.defaultCurrency === "USD" || platform.defaultCurrency === "PKR"
          ? platform.defaultCurrency
          : "PKR",
      tablePageSize: readTablePageSize(),
    });
  }, [platform, reset]);

  async function onSubmit(data: FormValues) {
    setSubmitError(null);
    try {
      writeTablePageSize(data.tablePageSize);
      await settingsApi.updatePlatform({
        appName: data.appName.trim(),
        supportEmail: data.supportEmail.trim(),
        defaultTimezone: data.defaultTimezone,
        defaultCurrency: data.defaultCurrency,
      });
      await qc.invalidateQueries({ queryKey: [PLATFORM_SETTINGS_QUERY_KEY] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not save platform settings.");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-2/3" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load settings"
        description="We could not fetch platform settings."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {submitError}
          </div>
        )}

        <FormField label="App Name" error={errors.appName?.message} required>
          <Input {...register("appName")} />
        </FormField>
        <FormField label="Support Email" error={errors.supportEmail?.message} required>
          <Input type="email" {...register("supportEmail")} />
        </FormField>
        <FormField label="Default Timezone" error={errors.defaultTimezone?.message} required>
          <Select {...register("defaultTimezone")}>
            <option value="Asia/Karachi">Pakistan (Asia/Karachi)</option>
          </Select>
        </FormField>
        <FormField label="Default Currency" error={errors.defaultCurrency?.message} required>
          <Select {...register("defaultCurrency")}>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
          </Select>
        </FormField>
        <FormField label="Table rows per page" error={errors.tablePageSize?.message} required>
          <Input
            type="number"
            min={TABLE_PAGE_SIZE_MIN}
            max={TABLE_PAGE_SIZE_MAX}
            {...register("tablePageSize", { valueAsNumber: true })}
          />
          <p className="text-xs text-slate-400">
            Saved in this browser for your tables. Min {TABLE_PAGE_SIZE_MIN}, max{" "}
            {TABLE_PAGE_SIZE_MAX}.
          </p>
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
