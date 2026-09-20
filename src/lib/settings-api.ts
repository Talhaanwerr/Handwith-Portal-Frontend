import { apiClient } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type {
  TenantSettings,
  UpdateSettingsPayload,
  PlatformSettings,
  UpdatePlatformSettingsPayload,
} from "@/types/settings";

export type SettingsExportType = "users" | "activity" | "all";

export const settingsApi = {
  get: () => apiClient.get<ApiEnvelope<TenantSettings>>("/settings"),

  update: (payload: UpdateSettingsPayload) =>
    apiClient.patch<ApiEnvelope<TenantSettings>>("/settings", payload),

  deleteTenant: () => apiClient.delete<void>("/settings/tenant"),

  /** CSV export with auth header (users / activity / all). */
  exportCsv: (type: SettingsExportType) =>
    apiClient.download(`/settings/export`, `workspace-export-${type}.csv`, {
      params: { type },
    }),

  getPlatform: () => apiClient.get<ApiEnvelope<PlatformSettings>>("/settings/platform"),

  updatePlatform: (payload: UpdatePlatformSettingsPayload) =>
    apiClient.patch<ApiEnvelope<PlatformSettings>>("/settings/platform", payload),
};
