import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";
import type { LibraryTier } from "@/lib/library-session-cookie";

export interface LibraryAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tier: LibraryTier;
  emailVerified: boolean;
  linkedToPortal: boolean;
}

export interface LibraryLoginResult {
  accessToken: string;
  user: LibraryAuthUser;
}

export interface LibraryMeUser extends LibraryAuthUser {
  childCount: number;
  createdAt: string;
}

export interface LibraryRegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LibraryLoginInput {
  email: string;
  password: string;
}

export const libraryAuthApi = {
  register(input: LibraryRegisterInput): Promise<ApiEnvelope<LibraryLoginResult>> {
    return apiClient.post<ApiEnvelope<LibraryLoginResult>>("/library/auth/register", input);
  },

  login(input: LibraryLoginInput): Promise<ApiEnvelope<LibraryLoginResult>> {
    return apiClient.post<ApiEnvelope<LibraryLoginResult>>("/library/auth/login", input);
  },

  refresh(): Promise<ApiEnvelope<{ accessToken: string }>> {
    return apiClient.post<ApiEnvelope<{ accessToken: string }>>("/library/auth/refresh");
  },

  logout(): Promise<ApiEnvelope<{ message: string }>> {
    return apiClient.post<ApiEnvelope<{ message: string }>>("/library/auth/logout");
  },

  me(): Promise<ApiEnvelope<LibraryMeUser>> {
    return apiClient.get<ApiEnvelope<LibraryMeUser>>("/library/auth/me");
  },

  verifyEmail(token: string): Promise<ApiEnvelope<{ message: string }>> {
    return apiClient.post<ApiEnvelope<{ message: string }>>("/library/auth/verify-email", {
      token,
    });
  },

  resendVerification(): Promise<ApiEnvelope<{ message: string }>> {
    return apiClient.post<ApiEnvelope<{ message: string }>>("/library/auth/resend-verification");
  },
};
