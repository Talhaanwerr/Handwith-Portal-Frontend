import { apiClient } from "./api-client";
import type { ApiEnvelope } from "@/types/api";
import type { WorkspaceTenant } from "@/types";

// ─── BE response shapes ───────────────────────────────────────────────────────
// These match the NestJS backend exactly. The auth store maps them to the FE
// User type after receiving them.

export interface BELoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  isSuperAdmin: boolean;
}

export interface BEMeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  isSuperAdmin: boolean;
  status: string;
  /** Active workspace Tenant.status (PENDING / ACTIVE / SUSPENDED / …). Null for Super Admin. */
  tenantStatus: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  timezone: string | null;
  createdAt: string;
  /** Flat "module:action" strings loaded from the user's roles. Super admins receive []. */
  permissions: string[];
  /** Workspace roles from /auth/me (display names, not FE routing hints). */
  roles: Array<{ id: string; name: string; slug: string }>;
  /** All workspaces this user belongs to (ACTIVE memberships). */
  tenants: WorkspaceTenant[];
  /** Currently active workspace. */
  activeTenant: WorkspaceTenant | null;
}

export interface LoginTokens {
  /** Short-lived in-memory access token */
  accessToken: string;
  /**
   * Refresh token is set as an httpOnly cookie by the backend.
   * @deprecated Use the httpOnly cookie instead.
   */
  refreshToken?: string;
  user: BELoginUser;
}

/** Returned by /auth/login when the user belongs to multiple workspaces. */
export interface LoginSelectionRequired {
  requiresTenantSelection: true;
  selectionToken: string;
  tenants: WorkspaceTenant[];
}

export type LoginResult = LoginTokens | LoginSelectionRequired;

export interface RefreshTokens {
  /** New short-lived access token */
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /auth/login
   * Returns either:
   *   - `LoginTokens` (single workspace or super admin)
   *   - `LoginSelectionRequired` (user has multiple workspaces)
   */
  login(credentials: LoginCredentials): Promise<ApiEnvelope<LoginResult>> {
    return apiClient.post<ApiEnvelope<LoginResult>>("/auth/login", credentials);
  },

  /**
   * POST /auth/select-tenant — step 2 for multi-workspace login.
   * Exchange the short-lived selectionToken for full session tokens.
   */
  selectTenant(selectionToken: string, tenantId: string): Promise<ApiEnvelope<LoginTokens>> {
    return apiClient.post<ApiEnvelope<LoginTokens>>("/auth/select-tenant", {
      selectionToken,
      tenantId,
    });
  },

  /**
   * POST /auth/switch-tenant — switch active workspace without re-login.
   * Returns a new access token; the httpOnly refresh cookie is rotated.
   */
  switchTenant(tenantId: string): Promise<ApiEnvelope<RefreshTokens>> {
    return apiClient.post<ApiEnvelope<RefreshTokens>>("/auth/switch-tenant", { tenantId });
  },

  /** POST /auth/logout */
  logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout");
  },

  /**
   * POST /auth/refresh — the httpOnly "rt" cookie is sent automatically
   * via credentials: "include". No body required.
   * The BE rotates the cookie and returns a new accessToken.
   */
  refresh(): Promise<ApiEnvelope<RefreshTokens>> {
    return apiClient.post<ApiEnvelope<RefreshTokens>>("/auth/refresh");
  },

  /** GET /auth/me — returns the currently authenticated user's full profile */
  me(): Promise<ApiEnvelope<BEMeUser>> {
    return apiClient.get<ApiEnvelope<BEMeUser>>("/auth/me");
  },

  /** POST /auth/forgot-password */
  forgotPassword(email: string): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/forgot-password", { email });
  },

  resetPassword(token: string, password: string): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/reset-password", { token, password });
  },

  verifyEmail(token: string): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/verify-email", { token });
  },

  resendVerification(): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/resend-verification");
  },

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/change-password", data);
  },

  /**
   * Accept an invite by setting a password via the reset-password endpoint.
   * After this call succeeds, the user should be redirected to login.
   * The BE marks the user as ACTIVE + emailVerified when it detects an invite token.
   */
  acceptInvite(data: { token: string; password: string }): Promise<ApiEnvelope<null>> {
    return apiClient.post<ApiEnvelope<null>>("/auth/reset-password", {
      token: data.token,
      password: data.password,
    });
  },
};
