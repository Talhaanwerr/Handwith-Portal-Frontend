"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PERMISSIONS } from "@/constants/permissions";
import { TherapyReportsPanel } from "@/features/tenant/therapy/TherapyReportsPanel";

export default function TherapyReportsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.THERAPY.READ} fallback={<Forbidden />}>
      <div className="space-y-6">
        <PageHeader
          title="Library Reports"
          description="Read-only Content Library play history for therapy children (does not update milestones)"
        />
        <TherapyReportsPanel />
      </div>
    </PermissionGuard>
  );
}

function Forbidden() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      You do not have permission to view therapy reports.
    </p>
  );
}
