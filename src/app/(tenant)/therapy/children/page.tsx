"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PERMISSIONS } from "@/constants/permissions";
import { TherapyChildrenPanel } from "@/features/tenant/therapy/TherapyChildrenPanel";

export default function TherapyChildrenPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.THERAPY.READ} fallback={<Forbidden />}>
      <div className="space-y-6">
        <PageHeader
          title="Therapy Children"
          description="Manage therapy children and link portal parents for homework + library SSO"
        />
        <TherapyChildrenPanel />
      </div>
    </PermissionGuard>
  );
}

function Forbidden() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      You do not have permission to view therapy children.
    </p>
  );
}
