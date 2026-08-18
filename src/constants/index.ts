export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SaaS Boilerplate";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3005";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4600/api/v1";

export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SELECT_WORKSPACE: "/select-workspace",
  FORBIDDEN: "/403",
  ACCOUNT_SUSPENDED: "/account-suspended",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  TENANT_DASHBOARD: "/dashboard",
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_USER: "TENANT_USER",
} as const;
