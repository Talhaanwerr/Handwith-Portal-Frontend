import type { ApiEnvelope } from "@/types/api";

export interface TenantSettings {
  id: string;
  tenantId: string;
  orgName: string | null;
  logo: string | null;
  timezone: string;
  currency: string;
  dateFormat: string;
  invoicePrefix: string;
  themeColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  orgName?: string;
  logo?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  invoicePrefix?: string;
  themeColor?: string;
}

export type SettingsResponse = ApiEnvelope<TenantSettings>;
