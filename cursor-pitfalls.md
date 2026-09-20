# Cursor Pitfalls

Living list of bugs we already hit and fixed.
Cursor must read this before changing related code.
When a new issue is fixed, append a new point at the bottom.
Copy this file into new projects so the same mistakes are not repeated.

## How to use

1. Before touching auth, API client, CSP, env, mailer, storage, ports, or login forms, check this file
2. After fixing any real bug, add one clear point here
3. Keep points short and practical
4. Write what went wrong and what the correct pattern is

## Resolved issues

1. S3 storage provider must not be constructed when `STORAGE_DRIVER=local`. Never call `getOrThrow` for `S3_BUCKET` or other S3 env vars unless `STORAGE_DRIVER=s3`. Local mode must work with S3 env vars missing or commented out.

2. Frontend CSP `connect-src` must allow the API origin only, such as `http://localhost:4600`. Do not put the full path `http://localhost:4600/api/v1` in CSP. Path-based CSP values block requests like `/auth/login`.

3. API client must not treat every `401` as an expired session. Public auth routes such as `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, and `/auth/select-tenant` must return the error to the UI. Do not silent-refresh and redirect to login on those routes. Wrong password must show an inline invalid credentials error, not refresh the page.

4. Login must not enforce password strength rules. Do not use `@MinLength(8)`, complexity regex, or similar on login DTOs or login form schemas. Login only needs required email, required password, and a max length DoS guard. Password strength belongs only on password create or change flows such as reset password, change password, register, and accept invite.

5. Do not allow `image/svg+xml` uploads by default. SVG can carry scripts and become an XSS risk when served from the same origin.

6. `/auth/refresh` must not require `refreshToken` in the request body. The refresh token comes from the httpOnly `rt` cookie. Keep body field optional for Swagger/curl only. A required body field causes `400 refreshToken should not be empty`, which breaks session restore after login and bounces users back to dashboard/login when protected pages call the API.

7. Access tokens are in-memory only. After login full-page redirects, call `initialize()` on app mount via an AuthProvider. Without this, the access token is lost, APIs return 401, refresh is attempted, and navigation appears to snap back to the dashboard when the session cookie still exists.

8. PlayLab game CSS sets `html, body { overflow: hidden; height: 100% }` in base.css. Do NOT import this file globally — it breaks the portal's scroll. Instead, wrap games in `.pl-shell { position: fixed; inset: 0; overflow: hidden }` and import only game-specific CSS files. See `src/playlab/playlab.css` and `src/app/(play)/layout.tsx`.

9. React 19 changed `useRef<T>(null)` to return `RefObject<T | null>`, not `RefObject<T>`. Functions that return a ref must use `RefObject<T | null>` in their signature. PlayLab's `useElementSize` was the affected hook during migration.

10. After login, do not blindly honor `?redirect=/dashboard`. Unauthenticated visits to `/` or `/dashboard` stamp that query param, so a SUPER_ADMIN would land in the tenant app. Resolve the destination with `getPostLoginPath(role, redirectTo)`: super admins go to `/super-admin/dashboard` unless the redirect is a super-admin (or `/play`) path. Root `/` must also role-route, never hardcode `/dashboard`.

11. `next/dynamic(..., { ssr: false })` is not allowed in Server Components (Next.js 16). Put the dynamic imports in a Client Component (`"use client"`) and render that from the page.
