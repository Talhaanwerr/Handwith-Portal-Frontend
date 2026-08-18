import { apiClient } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { TenantSettings, UpdateSettingsPayload } from "@/types/settings";

export const settingsApi = {
  get: () => apiClient.get<ApiEnvelope<TenantSettings>>("/settings"),

  update: (payload: UpdateSettingsPayload) =>
    apiClient.patch<ApiEnvelope<TenantSettings>>("/settings", payload),

  deleteTenant: () => apiClient.delete<void>("/settings/tenant"),
};
