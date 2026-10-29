"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PERMISSIONS } from "@/constants/permissions";
import { HomeworkPanel } from "@/features/tenant/therapy/HomeworkPanel";

export default function TherapyHomeworkPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.THERAPY.READ} fallback={<Forbidden />}>
      <div className="space-y-6">
        <PageHeader
          title="Homework"
          description="Assign library games as homework — completion and score sync automatically"
        />
        <HomeworkPanel />
      </div>
    </PermissionGuard>
  );
}

function Forbidden() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      You do not have permission to view homework.
    </p>
  );
}
