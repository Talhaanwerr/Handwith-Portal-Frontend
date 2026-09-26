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

12. A CSS `@container` query can only style elements INSIDE the container it asks about. A game's chrome (the `NavPillButton`, and Shapes & Pictures' red help button) is rendered next to the canvas, not inside it, so container-query rules for it silently never apply — the button stayed in the corner it was supposed to leave on a tall screen. Query the viewport with `@media (max-aspect-ratio: 1 / 1)` for chrome, and keep `@container` for what is drawn inside the canvas.

13. `UserMenu` must route by role. Super Admin My Profile and Settings must go to `/super-admin/profile` and `/super-admin/settings`. Never hardcode `/profile` or `/settings` for Super Admin or the tenant layout/sidebar will load.

14. Login form: do not show required asterisks on email/password. Password fields should include a show/hide eye toggle.

15. Tenant create/edit: require currency PKR or USD on create; show slug and currency read-only on edit; timezone dropdown is Pakistan only (`Asia/Karachi`) and preselected; custom domain must be a real hostname (reject values like `abc`); tenant `name` must be unique like slug (trimmed; backend `findFirst`); subdomain is optional on create. Local `.env.local` must set `API_PROXY_TARGET=http://localhost:4601` so create hits local Nest — Railway production ignores local uniqueness fixes and was allowing duplicate names like `abc`.

16. Super Admin dashboard must not use fake placeholder stats or fake recent logs. Use `GET /tenants/stats` and real `GET /audit-logs`. Show `0` when empty, never blank dashes for counts that exist in the DB.

17. Status filter chips that waste horizontal space on list pages should be a compact dropdown instead.

18. Table page size is a shared preference (`useTablePageSize`, min 3 max 20) controlled from Settings. List tables must use that page size with FE+BE pagination, not hardcoded limits.

19. Super Admin Feature Flags / Users / Profile: do not call tenant-scoped APIs that need `X-Tenant-ID`. Profile save uses `PATCH /users/me`. Feature Flags UI has no Create Flag — pick a tenant and enable/disable product flags. Tenant Feature Flags page is read-only.

20. Create Tenant form must collect owner name + email. After create, owner gets invite email; until SA Activates the tenant, owner login must land on `/account-pending` (session cookie `tenantStatus=PENDING`). Tenant detail needs Delete (soft-delete) plus Activate.

21. Super Admin Users table shows Tenants & Roles (not just SUPER ADMIN / Tenant User) and supports soft-delete. Audit Logs / Activity Logs use mapped actorName + eye detail dialog; SA audit is platform-scoped only.
