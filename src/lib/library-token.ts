/**
 * Library access token (in-memory). Separate from portal `tokenManager`
 * so therapy-center and library-only sessions do not overwrite each other.
 */

let libraryAccessToken: string | null = null;

export const libraryTokenManager = {
  getAccessToken(): string | null {
    return libraryAccessToken;
  },
  setAccessToken(token: string): void {
    libraryAccessToken = token;
  },
  clearAccessToken(): void {
    libraryAccessToken = null;
  },
  hasAccessToken(): boolean {
    return libraryAccessToken !== null;
  },
  clearAll(): void {
    libraryAccessToken = null;
  },
};
