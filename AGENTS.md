# AGENTS.md

This is a multi-tenant SaaS product built with NestJS (backend) and Next.js App Router (frontend).

Always follow:

- `.cursor/rules` for architecture, security, DB, and code quality rules
- `cursor-pitfalls.md` for known bugs — read it before touching auth, API client, CSP, env, storage, Prisma, or login forms
- TypeScript strict mode throughout
- Tenant isolation on every backend query
- RBAC and permissions on every protected endpoint and UI route
- Secure coding practices

Core habits:

- Never write a tenant query without tenantId
- Never add a package without checking it is necessary and stable
- Always inspect existing files before changing or adding code
- Follow current naming and folder structure
- Keep code clean, typed, and production-ready

After fixing a real bug, append one short lesson to `cursor-pitfalls.md` so it is not repeated.

After any change, mention which files changed, which commands to run, and any new env variables or migrations needed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
