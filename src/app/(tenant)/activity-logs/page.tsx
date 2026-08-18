import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ActivityLogsTable } from "@/features/tenant/activity-logs/ActivityLogsTable";

export const metadata: Metadata = { title: "Activity Logs" };

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="Audit trail for your workspace" />
      <ActivityLogsTable />
    </div>
  );
}
