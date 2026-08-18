/**
 * Frontend Permission Constants
 *
 * ⚠️  IMPORTANT — UX ONLY:
 * These constants are used to show/hide UI elements (buttons, menu items, pages).
 * They do NOT enforce actual security. The backend MUST enforce all authorization.
 * A user could bypass these checks by calling the API directly.
 *
 * Format: "module:action" — mirrors the backend PermissionsGuard format exactly.
 * Super admins bypass all permission checks on both frontend and backend.
 */

// ─── Users ────────────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  USERS: {
    CREATE: "users:create",
    READ: "users:read",
    UPDATE: "users:update",
    DELETE: "users:delete",
    MANAGE: "users:manage",
  },

  // ─── Tenants ────────────────────────────────────────────────────────────────
  TENANTS: {
    CREATE: "tenants:create",
    READ: "tenants:read",
    UPDATE: "tenants:update",
    DELETE: "tenants:delete",
    MANAGE: "tenants:manage",
  },

  // ─── Roles ──────────────────────────────────────────────────────────────────
  ROLES: {
    CREATE: "roles:create",
    READ: "roles:read",
    UPDATE: "roles:update",
    DELETE: "roles:delete",
    MANAGE: "roles:manage",
  },

  // ─── Permissions ────────────────────────────────────────────────────────────
  PERMISSIONS: {
    CREATE: "permissions:create",
    READ: "permissions:read",
    UPDATE: "permissions:update",
    DELETE: "permissions:delete",
    MANAGE: "permissions:manage",
  },

  // ─── Subscriptions ──────────────────────────────────────────────────────────
  SUBSCRIPTIONS: {
    CREATE: "subscriptions:create",
    READ: "subscriptions:read",
    UPDATE: "subscriptions:update",
    DELETE: "subscriptions:delete",
    MANAGE: "subscriptions:manage",
  },

  // ─── Settings ───────────────────────────────────────────────────────────────
  SETTINGS: {
    CREATE: "settings:create",
    READ: "settings:read",
    UPDATE: "settings:update",
    DELETE: "settings:delete",
    MANAGE: "settings:manage",
  },

  // ─── Files ──────────────────────────────────────────────────────────────────
  FILES: {
    CREATE: "files:create",
    READ: "files:read",
    UPDATE: "files:update",
    DELETE: "files:delete",
    MANAGE: "files:manage",
  },

  // ─── Notifications ───────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    CREATE: "notifications:create",
    READ: "notifications:read",
    UPDATE: "notifications:update",
    DELETE: "notifications:delete",
    MANAGE: "notifications:manage",
  },

  // ─── Audit Logs ─────────────────────────────────────────────────────────────
  AUDIT_LOGS: {
    READ: "audit-logs:read",
    MANAGE: "audit-logs:manage",
  },

  // ─── Feature Flags ──────────────────────────────────────────────────────────
  FEATURE_FLAGS: {
    CREATE: "feature-flags:create",
    READ: "feature-flags:read",
    UPDATE: "feature-flags:update",
    MANAGE: "feature-flags:manage",
  },
} as const;

/** Union of every permission string — useful for typing props. */
export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];
