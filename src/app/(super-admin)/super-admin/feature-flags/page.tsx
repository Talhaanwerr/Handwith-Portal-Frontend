import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureFlagsManager } from "@/features/super-admin/feature-flags/FeatureFlagsManager";

export const metadata: Metadata = { title: "Feature Flags" };

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Product features are listed here. Select a tenant to enable or disable each feature for that workspace."
      />
      <FeatureFlagsManager />
    </div>
  );
}
