"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api-error";
import { tenantsApi } from "@/lib/tenants-api";
import { TENANTS_QUERY_KEY, TENANT_DETAIL_QUERY_KEY } from "@/constants/query-keys";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  domain: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditTenantFormProps {
  tenantId: string;
}

export function EditTenantForm({ tenantId }: EditTenantFormProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: tenantRes, isLoading } = useQuery({
    queryKey: [TENANT_DETAIL_QUERY_KEY, tenantId],
    queryFn: () => tenantsApi.getOne(tenantId),
  });

  const tenant = tenantRes?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        domain: tenant.domain ?? "",
        timezone: tenant.timezone ?? "",
      });
    }
  }, [tenant, reset]);

  async function onSubmit(data: FormValues) {
    try {
      await tenantsApi.update(tenantId, data);
      qc.invalidateQueries({ queryKey: [TENANTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [TENANT_DETAIL_QUERY_KEY, tenantId] });
      router.push(`/super-admin/tenants/${tenantId}`);
    } catch (err) {
      setError("root", {
        message: err instanceof ApiError ? err.message : "Failed to update tenant.",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <FormField label="Tenant Name" error={errors.name?.message} required>
          <Input placeholder="Acme Corporation" {...register("name")} />
        </FormField>

        <FormField label="Custom Domain" error={errors.domain?.message}>
          <Input placeholder="app.acme.com" {...register("domain")} />
        </FormField>

        <FormField label="Timezone" error={errors.timezone?.message}>
          <Input placeholder="UTC" {...register("timezone")} />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
