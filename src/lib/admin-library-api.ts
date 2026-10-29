import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedPayload } from "@/types/api";
import type { LibraryContentItem } from "@/features/library/api";

export type AdminContentItem = LibraryContentItem & {
  isActive: boolean;
  isFeatured?: boolean;
  embedUrl?: string | null;
  fileId?: string | null;
  therapyRelevance?: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  stats?: {
    totalPlays: number;
    sessionCount: number;
    uniqueChildren: number;
    avgScore: number | null;
    avgCompletionPct: number | null;
    avgDurationSecs?: number | null;
    therapyAssignmentCount?: number;
    playsOverTime?: { date: string; count: number }[];
    ageBreakdown?: { bucket: string; count: number }[];
  };
};

export type LibraryPlatformAnalytics = {
  generatedAt: string;
  users: {
    total: number;
    free: number;
    premium: number;
    activeThisWeek: number;
    activeThisMonth: number;
  };
  sessions: {
    total: number;
    totalHours: number;
    totalSeconds: number;
  };
  topContent: {
    id: string;
    title: string;
    type: string;
    tier: string;
    playCount: number;
    thumbnailUrl: string | null;
  }[];
  charts: {
    userGrowth: { date: string; count: number }[];
    sessionsLast30Days: { date: string; count: number }[];
  };
};

export type AdminContentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  tier?: string;
  includeInactive?: boolean;
  sortBy?: "createdAt" | "playCount" | "title";
  sortOrder?: "asc" | "desc";
};

export type CreateContentPayload = {
  title: string;
  description?: string;
  type: string;
  embedUrl?: string;
  fileId?: string;
  thumbnailUrl?: string;
  tier?: string;
  ageRange: string;
  difficulty?: string;
  duration?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  therapyRelevance?: string[];
  tagIds?: string[];
};

export type BulkUpdatePayload = {
  contentItemIds: string[];
  tagIds?: string[];
  ageRange?: string;
  difficulty?: string;
  tier?: string;
};

export type LibraryParentListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  tier: "FREE" | "PREMIUM";
  createdAt: string;
  childCount: number;
};

export type LibraryParentDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  tier: "FREE" | "PREMIUM";
  createdAt: string;
  children: {
    id: string;
    name: string;
    dateOfBirth: string | null;
    primaryInterests: string[] | null;
    isActive: boolean;
    therapyChildId: string | null;
    createdAt: string;
    sessionCount: number;
  }[];
  subscriptions: {
    id: string;
    tier: string;
    startDate: string;
    endDate: string | null;
    managedByAdminId: string | null;
    createdAt: string;
  }[];
  recentSessions: {
    id: string;
    playedAt: string;
    durationSecs: number | null;
    score: number | null;
    completionPct: number | null;
    child: { id: string; name: string };
    content: { id: string; title: string; type: string; tier: string };
  }[];
};

export const adminLibraryApi = {
  listContent: (params?: AdminContentListParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<AdminContentItem>>>("/library/content", {
      params,
    }),

  getContent: (id: string) =>
    apiClient.get<ApiEnvelope<AdminContentItem>>(`/library/content/${id}`),

  createContent: (payload: CreateContentPayload) =>
    apiClient.post<ApiEnvelope<AdminContentItem>>("/library/content", payload),

  updateContent: (id: string, payload: Partial<CreateContentPayload>) =>
    apiClient.patch<ApiEnvelope<AdminContentItem>>(`/library/content/${id}`, payload),

  deleteContent: (id: string) =>
    apiClient.delete<ApiEnvelope<AdminContentItem>>(`/library/content/${id}`),

  setTags: (id: string, tagIds: string[]) =>
    apiClient.post<ApiEnvelope<AdminContentItem>>(`/library/content/${id}/tags`, { tagIds }),

  bulkUpdate: (payload: BulkUpdatePayload) =>
    apiClient.patch<
      ApiEnvelope<{ updated: number; tagCount: number; fields: Record<string, boolean> }>
    >("/library/content/bulk-tags", payload),

  listTags: (category?: string) =>
    apiClient.get<
      ApiEnvelope<{
        tags: { id: string; category: string; slug: string; label: string }[];
        grouped: Record<string, { id: string; category: string; slug: string; label: string }[]>;
      }>
    >("/library/tags", { params: category ? { category } : undefined }),

  listUsers: (params?: { page?: number; limit?: number; search?: string; tier?: string }) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<LibraryParentListItem>>>("/library/users", {
      params,
    }),

  getUser: (id: string) => apiClient.get<ApiEnvelope<LibraryParentDetail>>(`/library/users/${id}`),

  updateSubscription: (id: string, tier: "FREE" | "PREMIUM") =>
    apiClient.patch<ApiEnvelope<LibraryParentDetail>>(`/library/users/${id}/subscription`, {
      tier,
    }),

  getAnalytics: () =>
    apiClient.get<ApiEnvelope<LibraryPlatformAnalytics>>("/library/admin/analytics"),
};
