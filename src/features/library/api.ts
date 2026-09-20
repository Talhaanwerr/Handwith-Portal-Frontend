import type { ApiEnvelope, PaginatedPayload } from "@/types/api";
import { apiClient } from "@/lib/api-client";

export type LibraryContentItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  embedUrl: string | null;
  fileId: string | null;
  thumbnailUrl: string | null;
  tier: "FREE" | "PREMIUM";
  ageRange: string;
  difficulty: string;
  duration: string;
  playCount: number;
  tags: { id: string; category: string; slug: string; label: string }[];
};

export type BrowseParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  tier?: string;
  ageRange?: string;
  difficulty?: string;
  duration?: string;
  tagId?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  dateOfBirth: string | null;
  primaryInterests: string[] | null;
  isActive: boolean;
  therapyChildId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateChildInput = {
  name: string;
  dateOfBirth?: string;
  primaryInterests?: string[];
};

export type LibrarySession = {
  id: string;
  childProfileId: string;
  contentItemId: string;
  startedAt: string;
  endedAt: string | null;
  durationSecs: number | null;
  score: number | null;
  completionPct: number | null;
  sessionNumber: number;
};

export type CompleteSessionInput = {
  score?: number | null;
  completionPct?: number | null;
  durationSecs?: number | null;
};

export const INTEREST_OPTIONS = [
  "Communication",
  "Motor Skills",
  "Social",
  "Sensory",
  "Attention",
  "General",
] as const;

export const libraryApi = {
  browse: (params?: BrowseParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<LibraryContentItem>>>("/library/browse", {
      params,
    }),

  browseOne: (id: string) =>
    apiClient.get<ApiEnvelope<LibraryContentItem>>(`/library/browse/${id}`),

  tags: (category?: string) =>
    apiClient.get<
      ApiEnvelope<{
        tags: { id: string; category: string; slug: string; label: string }[];
        grouped: Record<string, { id: string; category: string; slug: string; label: string }[]>;
      }>
    >("/library/tags", { params: category ? { category } : undefined }),

  listChildren: () => apiClient.get<ApiEnvelope<ChildProfile[]>>("/library/children"),

  createChild: (body: CreateChildInput) =>
    apiClient.post<ApiEnvelope<ChildProfile>>("/library/children", body),

  updateChild: (id: string, body: Partial<CreateChildInput> & { isActive?: boolean }) =>
    apiClient.patch<ApiEnvelope<ChildProfile>>(`/library/children/${id}`, body),

  deleteChild: (id: string) =>
    apiClient.delete<ApiEnvelope<{ message: string }>>(`/library/children/${id}`),

  startSession: (body: { childProfileId: string; contentItemId: string }) =>
    apiClient.post<ApiEnvelope<LibrarySession>>("/library/sessions/start", body),

  completeSession: (sessionId: string, body: CompleteSessionInput) =>
    apiClient.post<ApiEnvelope<LibrarySession>>(`/library/sessions/${sessionId}/complete`, body),
};
