"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ImageIcon, X, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FileUploader } from "@/components/ui/file-uploader";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PermissionGuard } from "@/components/ui/permission-guard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/constants/permissions";
import { SETTINGS_QUERY_KEY } from "@/constants/query-keys";
import { settingsApi } from "@/lib/settings-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSafeErrorMessage } from "@/lib/safe-error";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";

const schema = z.object({
  orgName: z.string().min(2, "Organization name must be at least 2 characters").max(150),
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().length(3, "Use a 3-letter currency code (e.g. USD)"),
  dateFormat: z.string().min(1, "Date format is required"),
  invoicePrefix: z.string().max(20, "Max 20 characters"),
  themeColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Enter a valid hex color (e.g. #2563eb)"),
});

type FormValues = z.infer<typeof schema>;

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD MMM YYYY"];
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED", "CAD", "AUD"];

function isValidDomain(value: string) {
  return /^(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/.test(value.trim());
}

export function TenantSettingsForm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { logout } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // ── Allowed domains local state ──────────────────────────────────────────
  const [domains, setDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");

  // ── Danger zone state ────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: settingsApi.get,
  });

  const settings = res?.data;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!settings) return;
    reset({
      orgName: settings.orgName ?? "",
      timezone: settings.timezone || "UTC",
      currency: settings.currency || "USD",
      dateFormat: settings.dateFormat || "MM/DD/YYYY",
      invoicePrefix: settings.invoicePrefix || "INV-",
      themeColor: settings.themeColor || "#2563eb",
    });
  }, [settings, reset]);

  const update = useApiMutation(settingsApi.update, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast({
        title: "Settings saved",
        description: "Your organization preferences were updated.",
        variant: "success",
      });
    },
    onError: (err) => {
      toast({
        title: "Could not save settings",
        description: getSafeErrorMessage(err),
        variant: "error",
      });
    },
  });

  async function onSubmit(data: FormValues) {
    await update.mutateAsync(data);
  }

  // ── Allowed domains handlers ─────────────────────────────────────────────

  function addDomain() {
    const trimmed = domainInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidDomain(trimmed)) {
      setDomainError("Enter a valid domain, e.g. acme.com");
      return;
    }
    if (domains.includes(trimmed)) {
      setDomainError("Domain already added");
      return;
    }
    setDomains((prev) => [...prev, trimmed]);
    setDomainInput("");
    setDomainError("");
  }

  function removeDomain(d: string) {
    setDomains((prev) => prev.filter((x) => x !== d));
  }

  function handleDomainKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addDomain();
    }
  }

  // ── Danger zone: delete tenant ───────────────────────────────────────────

  const workspaceName = settings?.orgName ?? user?.name ?? "this workspace";

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    try {
      await settingsApi.deleteTenant();
      // All sessions are wiped on the BE — clear local state and redirect to login.
      setDeleteOpen(false);
      setDeleteConfirm("");
      toast({
        title: "Workspace deleted",
        description: "Your workspace has been permanently deleted.",
        variant: "success",
      });
      // Small delay so the toast is visible before redirect.
      await new Promise((r) => setTimeout(r, 1000));
      await logout();
      router.replace(ROUTES.LOGIN);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not delete workspace. Please try again.";
      toast({ title: "Deletion failed", description: message, variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-2/3" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <ErrorState
        title="Failed to load settings"
        description="We couldn't fetch your organization settings."
        onRetry={() => refetch()}
      />
    );
  }

  const themeColor = watch("themeColor");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Organization Profile</h2>
          <p className="mb-5 text-sm text-slate-500">Basic identity shown across the workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="settings-form">
            <FormField label="Organization Name" error={errors.orgName?.message} required>
              <Input {...register("orgName")} placeholder="Acme Corp" />
            </FormField>

            <FormField label="Logo" description="Upload placeholder — wire to file storage later.">
              <FileUploader
                accept="image/png,image/jpeg,image/webp"
                maxSizeMb={2}
                onSelect={() => {
                  toast({
                    title: "Logo upload placeholder",
                    description: "File selected. Connect to your storage API to persist logos.",
                    variant: "info",
                  });
                }}
                preview={
                  settings.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.logo}
                      alt="Organization logo"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  )
                }
              />
            </FormField>

            <FormField label="Theme Color" error={errors.themeColor?.message}>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor || "#2563eb"}
                  onChange={(e) => setValue("themeColor", e.target.value, { shouldDirty: true })}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
                  aria-label="Pick theme color"
                />
                <Input className="font-mono uppercase" maxLength={7} {...register("themeColor")} />
              </div>
            </FormField>
          </form>
        </div>

        {/* Regional & billing prefs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Regional & Billing</h2>
          <p className="mb-5 text-sm text-slate-500">
            Formats used in reports, invoices, and dates.
          </p>

          <div className="space-y-5">
            <FormField label="Timezone" error={errors.timezone?.message} required>
              <Select {...register("timezone")}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Currency" error={errors.currency?.message} required>
              <Select {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Date Format" error={errors.dateFormat?.message} required>
              <Select {...register("dateFormat")}>
                {DATE_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Invoice Prefix" error={errors.invoicePrefix?.message}>
              <Input {...register("invoicePrefix")} placeholder="INV-" form="settings-form" />
            </FormField>
          </div>
        </div>

        <PermissionGuard permission={PERMISSIONS.SETTINGS.UPDATE}>
          <div className="lg:col-span-2">
            <Button
              type="submit"
              form="settings-form"
              disabled={isSubmitting || update.isPending || !isDirty}
            >
              {(isSubmitting || update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </PermissionGuard>
      </div>

      {/* Allowed domains */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Allowed Email Domains</h2>
        <p className="mb-4 text-sm text-slate-500">
          Restrict who can join this workspace by email domain. Only users with matching email
          domains can accept invitations. Leave empty to allow any email address.
        </p>

        <div className="space-y-3">
          {/* Domain chips */}
          {domains.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {domains.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                >
                  @{d}
                  <button
                    type="button"
                    onClick={() => removeDomain(d)}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label={`Remove ${d}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add domain input */}
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                @
              </span>
              <Input
                value={domainInput}
                onChange={(e) => {
                  setDomainInput(e.target.value);
                  setDomainError("");
                }}
                onKeyDown={handleDomainKeyDown}
                placeholder="acme.com"
                className="pl-7"
              />
            </div>
            <Button type="button" variant="outline" onClick={addDomain}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {domainError && <p className="text-xs text-red-600">{domainError}</p>}

          {domains.length > 0 && (
            <p className="text-xs text-amber-600">
              Note: Wire the <code className="font-mono">domains</code> array to your membership
              settings endpoint to persist these restrictions.
            </p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-red-700">Danger Zone</h2>
        <p className="mb-5 text-sm text-slate-500">
          These actions are irreversible. Please proceed with caution.
        </p>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-100 bg-red-50 p-4">
          <div>
            <p className="text-sm font-medium text-red-900">Delete this workspace</p>
            <p className="mt-0.5 text-sm text-red-700">
              Permanently removes all data, members, and settings. This cannot be undone.
            </p>
          </div>
          <PermissionGuard permission={PERMISSIONS.SETTINGS.MANAGE}>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="shrink-0"
            >
              Delete Workspace
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(v) => !v && setDeleteOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-red-700">Delete workspace</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All data, users, roles, and settings
              will be erased.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Type <span className="font-semibold text-slate-900">{workspaceName}</span> to confirm.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={workspaceName}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm("");
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== workspaceName || isDeleting}
              onClick={handleDeleteConfirm}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
