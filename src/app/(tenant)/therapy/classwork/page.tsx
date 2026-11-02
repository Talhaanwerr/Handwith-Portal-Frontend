"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PERMISSIONS } from "@/constants/permissions";
import { ClassworkPanel } from "@/features/tenant/therapy/ClassworkPanel";

export default function TherapyClassworkPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.THERAPY.READ} fallback={<Forbidden />}>
      <div className="space-y-6">
        <PageHeader
          title="Classwork"
          description="Log in-session activities and optionally attach Content Library items"
        />
        <ClassworkPanel />
      </div>
    </PermissionGuard>
  );
}

function Forbidden() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      You do not have permission to view classwork.
    </p>
  );
}
