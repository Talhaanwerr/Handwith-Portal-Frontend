import { apiClient } from "./api-client";
import type { ApiEnvelope, PaginatedPayload } from "@/types/api";
import type {
  TenantListItem,
  TenantDetail,
  CreateTenantPayload,
  UpdateTenantPayload,
  ListTenantsParams,
} from "@/types/tenants";

/** All API calls for the /tenants resource (super admin only). */
export const tenantsApi = {
  list: (params?: ListTenantsParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<TenantListItem>>>("/tenants", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    }),

  getOne: (id: string) => apiClient.get<ApiEnvelope<TenantDetail>>(`/tenants/${id}`),

  create: (payload: CreateTenantPayload) =>
    apiClient.post<ApiEnvelope<TenantListItem>>("/tenants", payload),

  update: (id: string, payload: UpdateTenantPayload) =>
    apiClient.patch<ApiEnvelope<TenantListItem>>(`/tenants/${id}`, payload),

  activate: (id: string) => apiClient.patch<ApiEnvelope<TenantListItem>>(`/tenants/${id}/activate`),

  suspend: (id: string) => apiClient.patch<ApiEnvelope<TenantListItem>>(`/tenants/${id}/suspend`),

  cancel: (id: string) => apiClient.patch<ApiEnvelope<TenantListItem>>(`/tenants/${id}/cancel`),
};
