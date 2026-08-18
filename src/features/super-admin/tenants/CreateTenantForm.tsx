"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import { TENANTS_QUERY_KEY } from "@/constants/query-keys";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, and hyphens only"),
  domain: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateTenantForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await tenantsApi.create(data);
      qc.invalidateQueries({ queryKey: [TENANTS_QUERY_KEY] });
      router.push("/super-admin/tenants");
    } catch (err) {
      setError("root", {
        message: err instanceof ApiError ? err.message : "Failed to create tenant.",
      });
    }
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

        <FormField label="Slug" error={errors.slug?.message} required>
          <Input placeholder="acme-corp" {...register("slug")} />
          <p className="text-xs text-slate-400">Used in URLs. Lowercase, no spaces.</p>
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
            Create Tenant
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
