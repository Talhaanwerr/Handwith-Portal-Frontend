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
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api-error";
import { tenantsApi } from "@/lib/tenants-api";
import { TENANTS_QUERY_KEY } from "@/constants/query-keys";

const DOMAIN_REGEX = /^(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, and hyphens only"),
  subdomain: z
    .string()
    .optional()
    .refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), {
      message: "Subdomain: lowercase letters, numbers, and hyphens only",
    }),
  domain: z
    .string()
    .optional()
    .refine((v) => !v || DOMAIN_REGEX.test(v), {
      message: "Enter a valid domain such as app.acme.com",
    }),
  timezone: z.literal("Asia/Karachi"),
  currency: z.enum(["PKR", "USD"], { message: "Currency is required" }),
  ownerFirstName: z.string().min(1, "Owner first name is required"),
  ownerLastName: z.string().min(1, "Owner last name is required"),
  ownerEmail: z.string().email("Enter a valid owner email"),
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timezone: "Asia/Karachi",
      currency: "PKR",
      subdomain: "",
      domain: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await tenantsApi.create({
        name: data.name.trim(),
        slug: data.slug.trim(),
        subdomain: data.subdomain?.trim() || undefined,
        domain: data.domain?.trim() || undefined,
        timezone: data.timezone,
        currency: data.currency,
        ownerFirstName: data.ownerFirstName.trim(),
        ownerLastName: data.ownerLastName.trim(),
        ownerEmail: data.ownerEmail.trim().toLowerCase(),
      });
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

        <FormField label="Subdomain" error={errors.subdomain?.message}>
          <Input placeholder="acme (optional)" {...register("subdomain")} />
        </FormField>

        <FormField label="Custom Domain" error={errors.domain?.message}>
          <Input placeholder="app.acme.com" {...register("domain")} />
        </FormField>

        <FormField label="Currency" error={errors.currency?.message} required>
          <Select {...register("currency")}>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
          </Select>
        </FormField>

        <FormField label="Timezone" error={errors.timezone?.message} required>
          <Select {...register("timezone")}>
            <option value="Asia/Karachi">Pakistan (Asia/Karachi)</option>
          </Select>
        </FormField>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Tenant Owner</h3>
          <p className="mb-4 text-xs text-slate-500">
            They receive an email to set a password. The workspace stays locked until you Activate
            this tenant.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.ownerFirstName?.message} required>
                <Input placeholder="Jane" {...register("ownerFirstName")} />
              </FormField>
              <FormField label="Last Name" error={errors.ownerLastName?.message} required>
                <Input placeholder="Doe" {...register("ownerLastName")} />
              </FormField>
            </div>
            <FormField label="Email" error={errors.ownerEmail?.message} required>
              <Input type="email" placeholder="owner@acme.com" {...register("ownerEmail")} />
            </FormField>
          </div>
        </div>

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
