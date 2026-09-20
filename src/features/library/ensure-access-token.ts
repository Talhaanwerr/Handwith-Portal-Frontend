import { API_URL } from "@/constants";
import { libraryTokenManager } from "@/lib/library-token";

/**
 * Access tokens are in-memory only. After a full page reload, restore from the
 * httpOnly `lrt` refresh cookie when a library-session UX cookie is present.
 */
export async function ensureLibraryAccessToken(): Promise<string | null> {
  const existing = libraryTokenManager.getAccessToken();
  if (existing) return existing;

  try {
    const res = await fetch(`${API_URL}/library/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { accessToken?: string } };
    const token = json.data?.accessToken;
    if (!token) return null;
    libraryTokenManager.setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}
