import { apiClient } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type {
  FeatureFlagItem,
  TenantFeatureFlagItem,
  CreateFeatureFlagPayload,
  UpdateFeatureFlagPayload,
  FeatureAccessResult,
} from "@/types/feature-flags";

export const featureFlagsApi = {
  list: () =>
    apiClient.get<ApiEnvelope<(FeatureFlagItem | TenantFeatureFlagItem)[]>>("/feature-flags"),

  checkAccess: (slug: string) =>
    apiClient.get<ApiEnvelope<FeatureAccessResult>>(`/feature-flags/${slug}/access`),

  create: (payload: CreateFeatureFlagPayload) =>
    apiClient.post<ApiEnvelope<FeatureFlagItem>>("/feature-flags", payload),

  update: (slug: string, payload: UpdateFeatureFlagPayload) =>
    apiClient.patch<ApiEnvelope<FeatureFlagItem>>(`/feature-flags/${slug}`, payload),

  enable: (slug: string) =>
    apiClient.post<ApiEnvelope<TenantFeatureFlagItem>>(`/feature-flags/${slug}/enable`),

  disable: (slug: string) =>
    apiClient.post<ApiEnvelope<TenantFeatureFlagItem>>(`/feature-flags/${slug}/disable`),
};
