import { apiClient } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type {
  FeatureFlagItem,
  TenantFeatureFlagItem,
  UpdateFeatureFlagPayload,
  FeatureAccessResult,
} from "@/types/feature-flags";

export const featureFlagsApi = {
  list: (params?: { tenantId?: string }) =>
    apiClient.get<ApiEnvelope<(FeatureFlagItem | TenantFeatureFlagItem)[]>>("/feature-flags", {
      params,
    }),

  checkAccess: (slug: string) =>
    apiClient.get<ApiEnvelope<FeatureAccessResult>>(`/feature-flags/${slug}/access`),

  update: (slug: string, payload: UpdateFeatureFlagPayload) =>
    apiClient.patch<ApiEnvelope<FeatureFlagItem>>(`/feature-flags/${slug}`, payload),

  enable: (slug: string, tenantId: string) =>
    apiClient.post<ApiEnvelope<null>>(`/feature-flags/${slug}/enable`, { tenantId }),

  disable: (slug: string, tenantId: string) =>
    apiClient.post<ApiEnvelope<null>>(`/feature-flags/${slug}/disable`, { tenantId }),
};
