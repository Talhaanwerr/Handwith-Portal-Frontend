"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

const schema = z.object({
  appName: z.string().min(1, "App name is required"),
  supportEmail: z.string().email("Enter a valid email"),
  defaultTimezone: z.string(),
  defaultCurrency: z.string().length(3, "Enter a 3-letter currency code"),
});

type FormValues = z.infer<typeof schema>;

export function SuperAdminSettingsForm() {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      // TODO: fetch from GET /settings
      appName: "SaaS Boilerplate",
      supportEmail: "support@example.com",
      defaultTimezone: "UTC",
      defaultCurrency: "USD",
    },
  });

  async function onSubmit(data: FormValues) {
    // TODO: await apiClient.patch("/settings", data)
    console.warn("TODO: wire SuperAdminSettingsForm to PATCH /settings", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="App Name" error={errors.appName?.message} required>
          <Input {...register("appName")} />
        </FormField>
        <FormField label="Support Email" error={errors.supportEmail?.message} required>
          <Input type="email" {...register("supportEmail")} />
        </FormField>
        <FormField label="Default Timezone" error={errors.defaultTimezone?.message}>
          <Input {...register("defaultTimezone")} />
        </FormField>
        <FormField label="Default Currency" error={errors.defaultCurrency?.message}>
          <Input maxLength={3} placeholder="USD" {...register("defaultCurrency")} />
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
