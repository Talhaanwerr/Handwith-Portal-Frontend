import { API_URL, ROUTES } from "@/constants";
import { ApiError } from "./api-error";
import { tokenManager } from "./token";
import { libraryTokenManager } from "./library-token";
import type { ApiResponse, PaginatedResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const base = path.startsWith("http") ? path : `${API_URL}${path}`;
  if (!params) return base;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new ApiError(res.statusText || "Request failed", res.status);
    return undefined as T;
  }

  const json = await res.json();

  if (!res.ok) {
    // Never pass through raw nested objects / stacks to the UI
    const rawMessage = typeof json?.message === "string" ? json.message : "Request failed";
    const safeMessage =
      rawMessage.length > 200 || /stack|exception|prisma|sql/i.test(rawMessage)
        ? "Request failed"
        : rawMessage;
    throw new ApiError(safeMessage, res.status, json?.errors);
  }

  return json as T;
}

function normalizePath(path: string): string {
  return path.split("?")[0] ?? path;
}

function isLibraryApiPath(path: string): boolean {
  return normalizePath(path).startsWith("/library/");
}

/**
 * Public auth routes where a 401 means "bad credentials / invalid token",
 * not "access token expired". Never trigger silent refresh + redirect here.
 */
function isCredentialAuthPath(path: string): boolean {
  const normalized = normalizePath(path);
  return (
    normalized === "/auth/login" ||
    normalized === "/auth/refresh" ||
    normalized === "/auth/forgot-password" ||
    normalized === "/auth/reset-password" ||
    normalized === "/auth/verify-email" ||
    normalized === "/auth/select-tenant" ||
    normalized === "/library/auth/login" ||
    normalized === "/library/auth/register" ||
    normalized === "/library/auth/refresh" ||
    normalized === "/library/auth/verify-email"
  );
}

// ─── Refresh token flow (portal + library, isolated queues) ───────────────────

type RefreshScope = "portal" | "library";

const refreshState: Record<
  RefreshScope,
  {
    isRefreshing: boolean;
    queue: Array<(token: string) => void>;
    rejectQueue: Array<(err: unknown) => void>;
  }
> = {
  portal: { isRefreshing: false, queue: [], rejectQueue: [] },
  library: { isRefreshing: false, queue: [], rejectQueue: [] },
};

async function refreshPortalAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  const json = (await res.json()) as { data?: { accessToken?: string } } | undefined;
  const newAccessToken = json?.data?.accessToken;
  if (!newAccessToken || typeof newAccessToken !== "string") {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  return newAccessToken;
}

async function refreshLibraryAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/library/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new ApiError("Library session expired. Please sign in again.", 401);
  }

  const json = (await res.json()) as { data?: { accessToken?: string } } | undefined;
  const newAccessToken = json?.data?.accessToken;
  if (!newAccessToken || typeof newAccessToken !== "string") {
    throw new ApiError("Library session expired. Please sign in again.", 401);
  }

  return newAccessToken;
}

async function handleUnauthorizedRefresh(scope: RefreshScope): Promise<string> {
  const state = refreshState[scope];

  if (!state.isRefreshing) {
    state.isRefreshing = true;
    try {
      const newToken =
        scope === "library" ? await refreshLibraryAccessToken() : await refreshPortalAccessToken();

      if (scope === "library") {
        libraryTokenManager.setAccessToken(newToken);
      } else {
        tokenManager.setAccessToken(newToken);
      }

      state.queue.forEach((cb) => cb(newToken));
      return newToken;
    } catch (err) {
      state.rejectQueue.forEach((cb) => cb(err));
      if (scope === "library") {
        libraryTokenManager.clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LIBRARY_LOGIN;
        }
      } else {
        tokenManager.clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LOGIN;
        }
      }
      throw err;
    } finally {
      state.isRefreshing = false;
      state.queue = [];
      state.rejectQueue = [];
    }
  }

  return new Promise<string>((resolve, reject) => {
    state.queue.push(resolve);
    state.rejectQueue.push(reject);
  });
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { params, headers: extraHeaders, ...rest } = options;
  const url = buildUrl(path, params);
  const libraryScope = isLibraryApiPath(path);

  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders as Record<string, string>),
  };

  const token = libraryScope ? libraryTokenManager.getAccessToken() : tokenManager.getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  if (res.status === 401 && !isRetry && !isCredentialAuthPath(path)) {
    await handleUnauthorizedRefresh(libraryScope ? "library" : "portal");
    return request<T>(method, path, body, options, true);
  }

  return parseResponse<T>(res);
}

// ─── Public API client ────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options);
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },

  /** Authenticated binary/text download (CSV, files). Triggers browser save via blob URL. */
  async download(
    path: string,
    filename: string,
    options?: RequestOptions,
    isRetry = false
  ): Promise<void> {
    const url = buildUrl(path, options?.params);
    const token = tokenManager.getAccessToken();
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> | undefined),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (res.status === 401 && !isRetry) {
      await handleUnauthorizedRefresh("portal");
      return apiClient.download(path, filename, options, true);
    }

    if (!res.ok) {
      throw new ApiError(res.statusText || "Download failed", res.status);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  },

  getOne<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>("GET", path, undefined, options);
  },

  getPaginated<T>(path: string, options?: RequestOptions): Promise<PaginatedResponse<T>> {
    return request<PaginatedResponse<T>>("GET", path, undefined, options);
  },

  postOne<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>("POST", path, body, options);
  },

  patchOne<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>("PATCH", path, body, options);
  },
};
