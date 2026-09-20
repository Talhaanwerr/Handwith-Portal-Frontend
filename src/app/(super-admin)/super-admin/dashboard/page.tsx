import type { Metadata } from "next";
import { SuperAdminDashboard } from "@/features/super-admin/dashboard/SuperAdminDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function SuperAdminDashboardPage() {
  return <SuperAdminDashboard />;
}
