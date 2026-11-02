"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MyHomeworkPanel } from "@/features/tenant/therapy/MyHomeworkPanel";

export default function MyHomeworkPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Homework"
        description="Homework assigned to your children — play attached games here in the portal"
      />
      <MyHomeworkPanel />
    </div>
  );
}
