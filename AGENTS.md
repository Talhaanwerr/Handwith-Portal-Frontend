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
