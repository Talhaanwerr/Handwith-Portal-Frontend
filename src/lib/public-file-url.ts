/**
 * Prefer same-origin public file paths so CSP img-src 'self' and the FE
 * `/api/v1` proxy work. Absolute BE URLs (e.g. http://localhost:4601/...)
 * are rewritten to `/api/v1/files/:id/content`.
 */
export function normalizePublicFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    if (/\/api\/v1\/files\/[^/]+\/content\/?$/.test(parsed.pathname)) {
      return parsed.pathname;
    }
  } catch {
    return url;
  }
  return url;
}
