import { apiClient } from "./api-client";
import type { ApiEnvelope, PaginatedPayload } from "@/types/api";

export type TherapyParent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type TherapyChild = {
  id: string;
  tenantId: string;
  name: string;
  dateOfBirth: string | null;
  parentUserId: string | null;
  parent: TherapyParent | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  counts?: {
    homework: number;
    classwork: number;
    linkedLibraryProfiles: number;
  };
};

export type TherapyContentCard = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  thumbnailUrl: string | null;
  tier: string;
  ageRange: string;
  difficulty: string;
  duration: string;
  playCount: number;
  embedUrl?: string | null;
  fileId?: string | null;
  tags: { id: string; category: string; slug: string; label: string }[];
};

export type HomeworkAssignment = {
  id: string;
  tenantId: string;
  therapyChildId: string;
  therapyChild: { id: string; name: string; parentUserId: string | null };
  contentItemId: string | null;
  content: TherapyContentCard | null;
  title: string | null;
  instructions: string;
  dueDate: string | null;
  status: "ASSIGNED" | "COMPLETED" | "OVERDUE" | "CANCELLED";
  score: number | null;
  completionPct: number | null;
  assignedById: string;
  assignedBy: { id: string; firstName: string; lastName: string };
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  gameCompletedLabel: string | null;
};

export type ClassworkLog = {
  id: string;
  therapyChildId: string;
  therapyChild: { id: string; name: string };
  contentItemId: string | null;
  content: TherapyContentCard | null;
  description: string;
  sessionDate: string;
  loggedBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
};

export type HomeworkPlayStart = {
  sessionId: string;
  homeworkAssignmentId: string;
  childProfileId: string;
  contentItemId: string;
  content: TherapyContentCard;
  startedAt: string;
};

export type LibraryHistoryPayload = {
  items: {
    id: string;
    playedAt: string;
    endedAt: string | null;
    durationSecs: number | null;
    score: number | null;
    completionPct: number | null;
    sessionNumber: number;
    homeworkAssignmentId: string | null;
    childProfileId: string;
    content: TherapyContentCard;
  }[];
  meta: PaginatedPayload<unknown>["meta"];
  linkedLibraryChildren: { id: string; name: string }[];
  note: string | null;
};

type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
  therapyChildId?: string;
  status?: string;
  from?: string;
  to?: string;
  type?: string;
  skillTagId?: string;
};

export const therapyApi = {
  listChildren: (params?: ListParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<TherapyChild>>>("/therapy/children", { params }),

  getChild: (id: string) => apiClient.get<ApiEnvelope<TherapyChild>>(`/therapy/children/${id}`),

  createChild: (body: {
    name: string;
    dateOfBirth?: string;
    parentUserId?: string;
    notes?: string;
  }) => apiClient.post<ApiEnvelope<TherapyChild>>("/therapy/children", body),

  updateChild: (
    id: string,
    body: Partial<{
      name: string;
      dateOfBirth: string | null;
      parentUserId: string | null;
      notes: string | null;
      isActive: boolean;
    }>
  ) => apiClient.patch<ApiEnvelope<TherapyChild>>(`/therapy/children/${id}`, body),

  deleteChild: (id: string) =>
    apiClient.delete<ApiEnvelope<{ id: string; deleted: true }>>(`/therapy/children/${id}`),

  listHomework: (params?: ListParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<HomeworkAssignment>>>("/therapy/homework", {
      params,
    }),

  createHomework: (body: {
    therapyChildId: string;
    contentItemId?: string;
    title?: string;
    instructions: string;
    dueDate?: string;
  }) => apiClient.post<ApiEnvelope<HomeworkAssignment>>("/therapy/homework", body),

  updateHomework: (
    id: string,
    body: Partial<{
      contentItemId: string | null;
      title: string | null;
      instructions: string;
      dueDate: string | null;
      status: string;
    }>
  ) => apiClient.patch<ApiEnvelope<HomeworkAssignment>>(`/therapy/homework/${id}`, body),

  cancelHomework: (id: string) =>
    apiClient.delete<ApiEnvelope<HomeworkAssignment>>(`/therapy/homework/${id}`),

  listMyHomework: (params?: ListParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<HomeworkAssignment>>>("/therapy/my-homework", {
      params,
    }),

  startHomeworkPlay: (id: string) =>
    apiClient.post<ApiEnvelope<HomeworkPlayStart>>(`/therapy/homework/${id}/play`, {}),

  completeHomeworkSession: (
    sessionId: string,
    body: { score?: number | null; completionPct?: number | null; durationSecs?: number | null }
  ) => apiClient.post<ApiEnvelope<unknown>>(`/therapy/sessions/${sessionId}/complete`, body),

  listClasswork: (params?: ListParams) =>
    apiClient.get<ApiEnvelope<PaginatedPayload<ClassworkLog>>>("/therapy/classwork", { params }),

  createClasswork: (body: {
    therapyChildId: string;
    contentItemId?: string;
    description: string;
    sessionDate: string;
  }) => apiClient.post<ApiEnvelope<ClassworkLog>>("/therapy/classwork", body),

  libraryHistory: (therapyChildId: string, params?: ListParams) =>
    apiClient.get<ApiEnvelope<LibraryHistoryPayload>>(
      `/therapy/children/${therapyChildId}/library-history`,
      { params }
    ),
};
