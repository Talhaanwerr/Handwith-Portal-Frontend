/** Types mirroring the backend TenantsService shapes. */

import type { TenantStatus } from "@/types";

/** Returned by GET /tenants (list) */
export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  status: TenantStatus;
  timezone: string;
  currency: string;
  logo: string | null;
  ownerUserId: string | null;
  createdAt: string;
}

/** Subscription summary nested in TenantDetail */
export interface TenantSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  plan: {
    id: string;
    name: string;
    slug: string;
  };
}

/** Returned by GET /tenants/:id */
export interface TenantDetail extends TenantListItem {
  subscriptions: TenantSubscription[];
  settings: {
    orgName: string | null;
    timezone: string;
    currency: string;
    invoicePrefix: string;
  } | null;
  _count: { users: number };
}

/** POST /tenants */
export interface CreateTenantPayload {
  name: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerUserId?: string;
  timezone?: string;
  currency: "PKR" | "USD";
  logo?: string;
}

/** PATCH /tenants/:id */
export interface UpdateTenantPayload {
  name?: string;
  domain?: string | null;
  subdomain?: string | null;
  ownerUserId?: string;
  timezone?: string;
  logo?: string;
}

export interface TenantPlatformStats {
  totalTenants: number;
  activeTenants: number;
  pendingTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;
  newThisMonth: number;
  totalUsers: number;
}

export interface ListTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
