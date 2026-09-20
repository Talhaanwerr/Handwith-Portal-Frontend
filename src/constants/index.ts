export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SaaS Boilerplate";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3007";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SELECT_WORKSPACE: "/select-workspace",
  FORBIDDEN: "/403",
  ACCOUNT_SUSPENDED: "/account-suspended",
  ACCOUNT_PENDING: "/account-pending",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  TENANT_DASHBOARD: "/dashboard",
  /** Content Library (not Super Admin PlayLab games at /super-admin/library) */
  LIBRARY: "/library",
  LIBRARY_BROWSE: "/library/browse",
  LIBRARY_DASHBOARD: "/library/dashboard",
  LIBRARY_GAME: "/library/game",
  LIBRARY_LOGIN: "/library/login",
  LIBRARY_REGISTER: "/library/register",
  LIBRARY_VERIFY_EMAIL: "/library/verify-email",
  LIBRARY_HISTORY: "/library/history",
  LIBRARY_CHILDREN: "/library/children",
  LIBRARY_SETUP_CHILD: "/library/setup-child",
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_USER: "TENANT_USER",
} as const;
