import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PermissionsMatrix } from "@/features/tenant/permissions/PermissionsMatrix";

export const metadata: Metadata = { title: "Permissions" };

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="View and manage permissions per role" />
      <PermissionsMatrix />
    </div>
  );
}
