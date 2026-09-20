/**
 * Library Session Cookie
 *
 * UX routing hint for public parents who register on the library site
 * (Phase 4 auth will set this). NOT a security boundary — backend JWT enforces access.
 *
 * Separate from portal `next-session` so therapy-center parents can keep
 * their portal cookie while library-only parents use this one.
 */

export type LibraryTier = "FREE" | "PREMIUM";

export interface LibrarySessionPayload {
  kind: "library";
  tier: LibraryTier;
}

const COOKIE_NAME = "library-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const VALID_TIERS: ReadonlySet<string> = new Set(["FREE", "PREMIUM"]);

export function setLibrarySessionCookie(payload: Omit<LibrarySessionPayload, "kind">): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ kind: "library", tier: payload.tier }));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearLibrarySessionCookie(): void {
  if (typeof document === "undefined") return;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function parseLibrarySessionCookie(cookieHeader: string): LibrarySessionPayload | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as Partial<LibrarySessionPayload>;
    if (parsed.kind !== "library") return null;
    if (!parsed.tier || !VALID_TIERS.has(parsed.tier)) return null;
    return { kind: "library", tier: parsed.tier };
  } catch {
    return null;
  }
}
